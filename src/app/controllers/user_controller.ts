import { User } from "../types/user";
import { environment } from "../../environments/environment";
import { get } from "http";

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
  error?: string; //La api regresa error en caso de un error.
};

export class UserController {
    private user: User | null = null;
    private readonly API_URL = environment.apiUrl;

    constructor() {}

    getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
    }

    async registerUser(userData: { nombre: string; apellidos: string; correo: string; telefono: string; password: string }): Promise<{status: number, authResponse: AuthResponse | null; error?: string}> {
        let statusCode: number = 0;
        try {
            const response = await fetch(`${this.API_URL}/auth/registerUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData : AuthResponse = await response.json();
                throw new Error(errorData.error || 'Error al registrar usuario');
            }

            statusCode = response.status;
            const result = await response.json();
            const user = result.user as User;
            this.user = user;
            //Registro exitoso.
            return {status: response.status, authResponse: result as AuthResponse};
        } catch (error) {
            console.error('Error en registerUser:', error);
            return {status: statusCode, authResponse: null, error: error as string};
        }
    }

    async loginUser(correo: string, password: string): Promise<{status: number, authResponse?: AuthResponse, error?: string}> {
        let statusCode: number = 0;
        try {
            const response = await fetch(`${this.API_URL}/auth/loginUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo, password }),
            });

            if (!response.ok) {
                const errorData : AuthResponse = await response.json();
                // return {status: response.status, authResponse: errorData};
                throw new Error(errorData.error || 'Error al iniciar sesión');
            }

            statusCode = response.status;
            const result = await response.json();
            const user = result.user as User;
            this.setUser(user);
            return {status: response.status, authResponse: result as AuthResponse};
        } catch (error) {
            console.error('Error en loginUser:', error);
            return {status: statusCode, authResponse: undefined, error: error as string};
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