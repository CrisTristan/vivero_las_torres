import { environment } from "../../environments/environment";

export default class ForgotPasswordModel {
    correo: string = "";

    constructor(correo: string) {
        this.correo = correo;
    }

    async requestPasswordReset() : Promise<{success: boolean, message: string}> {
        try {
            const response = await fetch(`${environment.apiUrl}/password-recovery`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ correo: this.correo }),
            });
            if (!response.ok) {
                throw new Error("Error requesting password reset");
            }
            return response.json();
        } catch (error) {
            console.error("Error requesting password reset:", error);
            return { success: false, message: "Error requesting password reset" };
        }
    }

    async validateTokenPasswordReset(token: string) : Promise<{valid: boolean, correo: string, message: string}> {
        try {
            const response = await fetch(`${environment.apiUrl}/password-recovery/validate?token=${token}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                console.error("Error validating token:", response.statusText);
                return { valid: false, correo: "", message: "Error validating token" };
            }
        } catch (error) {
            console.error("Error validating token:", error);
            return { valid: false, correo: "", message: "Error validating token" };
        }
    }

    async resetPassword(token: string, newPassword: string) : Promise<{success: boolean, message: string}> {
        try {
            const response = await fetch(`${environment.apiUrl}/password-recovery/reset`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();
            if (response.ok) {
               return data;
            } else {
                console.error("Error resetting password:", response.statusText);
                return { success: false, message: data.error };
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            return { success: false, message: "Error resetting password" };
        }
    }

}