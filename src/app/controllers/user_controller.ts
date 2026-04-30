import { User } from "../types/user";
import { environment } from "../../environments/environment";
import { get } from "http";

type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export class UserController {
    private user: User | null = null;
    private readonly API_URL = environment.apiUrl;

    constructor() {}

    getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
    }

    async registerUser(userData: { nombre: string; apellidos: string; correo: string; telefono: string; password: string }): Promise<{status: number, authResponse: AuthResponse | null; error?: string}> {
        try {
            const response = await fetch(`${this.API_URL}/auth/registerUser`, {
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
            return {status: response.status, authResponse: result as AuthResponse};
        } catch (error) {
            console.error('Error en registerUser:', error);
            return {status: 500, authResponse: null, error: (error as Error).message};
        }
    }

    async loginUser(correo: string, password: string): Promise<{status: number, authResponse?: AuthResponse}> {
        try {
            const response = await fetch(`${this.API_URL}/auth/loginUser`, {
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
            return {status: response.status, authResponse: result as AuthResponse};
        } catch (error) {
            console.error('Error en loginUser:', error);
            throw error;
        }
    }

    async verifyTokenWithMe(): Promise<{ status: number; user: User | null; hasToken: boolean }> {
        try {
            const response = await fetch(`${this.API_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.getAccessToken()}`,
                },
            });
            if (!response.ok) {
                throw new Error('Token no válido');
            }
            const result = await response.json();
            const user = result.user as User;
            this.setUser(user);
            return { status: response.status, user, hasToken: this.getAccessToken() !== null };
        } catch (error) {
            console.error('Error en verifyTokenWithMe:', error);
            this.clearUser();
            return { status: 500, user: null, hasToken: this.getAccessToken() !== null };
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