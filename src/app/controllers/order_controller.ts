import { AuthService } from "../services/auth-service";
import { ShoppingCartService } from "../services/shopping-cart-service";
import { User } from "../types/user";
import { Product } from "../types/product.type";
import { Order } from "../types/order.type";
import {environment } from "../../environments/environment";

export default class OrderController {
  constructor(
    private authService: AuthService,
    private shoppingCartService: ShoppingCartService,
  ) {}

  //esta funcion se encarga de hacer una orden, para eso se hace una peticion al backend con los
  // datos del usuario y los items del carrito,
  // el backend se encarga de procesar la orden y devolver una respuesta, para esto se hace
  // una peticion a /createOrder con {usuario_id, total, estado, productos: [{producto_id, cantidad}]}
  async placeNormalOrder() : Promise<{message: string, order: Order, productos: {cantidad: number, id: number, order_id: number, precio_unitario: number, producto_id: number}[]}>{
    const user: User | null = this.authService.getUser();
    if (!user) {
      throw new Error("Usuario no autenticado");
    }
    const cartItems = this.shoppingCartService.getCartItems();
    console.log("Items del carrito de productos:", cartItems);

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
      const response = await fetch(`${environment.apiUrl}/createOrder`, {
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
      return result;
    } catch (error) {
      console.error("Error al crear la orden:", error);
      throw error;
    }
  }

  async placePersonalizedArrangementOrder() : Promise<{message: string, order: Order, productos: {cantidad: number, id: number, order_id: number, precio_unitario: number, producto_id: number}[]}> {
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
      const response = await fetch(`${environment.apiUrl}/createOrder`, {
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
      return result;
    } catch (error) {
      console.error("Error al crear la orden:", error);
      throw error;
    }
  }

  filterRepeatedProductsOnShoppingCart(
    cartItems: Product[],
  ): { producto_id: number; cantidad: number }[] {
    const productMap = new Map<number, { cantidad: number; precio_unitario: number; nombre_producto: string; imagen_producto: string }>();
    
    cartItems.forEach((item) => {
      if (!item?.productos?.id) return;
      
      const prodId = item.productos.id;
      const existing = productMap.get(prodId);
      
      if (existing) {
        existing.cantidad += 1;
      } else {
        productMap.set(prodId, {
          cantidad: 1,
          precio_unitario: item.productos?.precio || 0,
          nombre_producto: item.productos?.nombre || "",
          imagen_producto: item.productos?.imagen || "",
        });
      }
    });

    return Array.from(productMap.entries()).map(([id, data]) => ({
      producto_id: id,
      cantidad: data.cantidad,
      precio_unitario: data.precio_unitario,
      nombre_producto: data.nombre_producto,
      imagen_producto: data.imagen_producto,
    }));
  }

  async getLast10Orders(): Promise<Order[]> {
    try {
      const response = await fetch(`${environment.apiUrl}/ordenes/getLast10Orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Error al obtener las últimas 10 órdenes: ${response.status}`);
      }
      const result = await response.json();
      console.log("Últimas 10 órdenes:", result);
      return result;
    } catch (error) {
      console.error("Error al obtener las últimas 10 órdenes:", error);
      throw error;
    }
  }
}
