import { AuthService } from "../services/auth-service";
import { ShoppingCartService } from "../services/shopping-cart-service";
import { User } from "../types/user";
import { Product } from "../types/product.type";
import { Order } from "../types/order.type";

export default class OrderController {
  constructor(
    private authService: AuthService,
    private shoppingCartService: ShoppingCartService,
  ) {}

  //esta funcion se encarga de hacer una orden, para eso se hace una peticion al backend con los
  // datos del usuario y los items del carrito,
  // el backend se encarga de procesar la orden y devolver una respuesta, para esto se hace
  // una peticion a /createOrder con {usuario_id, total, estado, productos: [{producto_id, cantidad}]}
  async placeNormalOrder() {
    const user: User | null = this.authService.getUser();
    if (!user) {
      throw new Error("Usuario no autenticado");
    }
    const cartItems = this.shoppingCartService.getCartItems();

    if (cartItems.length === 0) {
      console.log("El carrito de productos está vacío");
    }

    const orderData = {
      usuario_id: user?.id,
      total: this.shoppingCartService.total,
      estado: "no entregado",
      es_arreglo_personalizado: false,
      productos: this.filterRepeatedProductsOnShoppingCart(cartItems),
    };
    // console.log('Datos de la orden a enviar:', orderData);
    try {
      const response = await fetch("http://localhost:3000/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error(`Error al crear la orden: ${response.status}`);
      }
      const result = await response.json();
      console.log("Orden creada:", result);
    } catch (error) {
      console.error("Error al crear la orden:", error);
      throw error;
    }
  }

  async placePersonalizedArrangementOrder() {
    const user: User | null = this.authService.getUser();
    if (!user) {
      throw new Error("Usuario no autenticado");
    }
    const cartPersonalizedArrangementItems =
      this.shoppingCartService.getPersonalizedArrangementItems();
    console.log(
      "Items del arreglo personalizado en el carrito:",
      cartPersonalizedArrangementItems,
    );
    if (cartPersonalizedArrangementItems.length === 0) {
      console.log("El carrito de arrglo personalizado está vacío");
    }

    const orderData = {
      usuario_id: user?.id,
      total:
        this.shoppingCartService.totalInCartItemsForPersonalizedArrangement,
      estado: "no entregado",
      es_arreglo_personalizado: true,
      productos: this.filterRepeatedProductsOnShoppingCart(
        cartPersonalizedArrangementItems,
      ),
    };
    // console.log('Datos de la orden a enviar:', orderData);
    try {
      const response = await fetch("http://localhost:3000/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error(`Error al crear la orden: ${response.status}`);
      }
      const result = await response.json();
      console.log("Orden creada:", result);
    } catch (error) {
      console.error("Error al crear la orden:", error);
      throw error;
    }
  }

  filterRepeatedProductsOnShoppingCart(
    cartItems: Product[],
  ): { producto_id: number; cantidad: number }[] {
    const productMap: { [key: number]: number } = {};
    cartItems.forEach((item) => {
      const prodId = item.productos.id;
      if (productMap[prodId]) {
        productMap[prodId] += 1;
      } else {
        productMap[prodId] = 1;
      }
    });
    return Object.entries(productMap).map(([id, cantidad]) => ({
      producto_id: Number(id),
      cantidad,
      precio_unitario: //Precio que pago el cliente al momento de la compra por el producto
        cartItems.find((item) => item.productos.id === Number(id))?.productos
          .precio || 0,
    }));
  }
}
