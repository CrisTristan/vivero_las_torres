import { User } from "../types/user";
import { environment } from "../../environments/environment";

export class UserController {
    private user: User | null = null;
    private readonly API_URL = environment.apiUrl;

    constructor() {}

    async registerUser(userData: { nombre: string; apellidos: string; correo: string; telefono: string; password: string }): Promise<User | null> {
        try {
            const response = await fetch(`${this.API_URL}/registerUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al registrar usuario');
            }

            const result = await response.json();
            const user = result.user as User;
            this.user = user;
            return user;
        } catch (error) {
            console.error('Error en registerUser:', error);
            throw error;
        }
    }

    async loginUser(correo: string, password: string): Promise<User | null> {
        try {
            const response = await fetch(`${this.API_URL}/loginUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al iniciar sesión');
            }

            const result = await response.json();
            const user = result.user as User;
            this.setUser(user);
            return user;
        } catch (error) {
            console.error('Error en loginUser:', error);
            throw error;
        }
    }

    async updateUserPassword(newPassword: string): Promise<User | null> {
        try {
            const updatedData = {
                ...this.user,
                password_hashed: newPassword
            };
            const response = await fetch(`${this.API_URL}/updateUserPassword`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar contraseña');
            }

            const result = await response.json();
            const user = result.user as User;
            this.setUser(user);
            return user;
        } catch (error) {
            console.error('Error en updateUserPassword:', error);
            throw error;
        }
    }

    setUser(user: User) {
        this.user = user;
    }   

    getUser(): User | null {
        return this.user;
    }

    clearUser() {
        this.user = null;
    }
}