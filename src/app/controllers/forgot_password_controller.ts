import ForgotPasswordModel from "../models/forgot_password_model";

export default class ForgotPasswordController {
    correo: string = "";

    constructor(correo: string) {
        this.correo = correo;
    }

    async requestPasswordReset() : Promise<{success: boolean, message: string}> {
        const forgotPasswordModel = new ForgotPasswordModel(this.correo);
        return await forgotPasswordModel.requestPasswordReset();
    }

    async validateTokenPasswordReset(token: string) : Promise<{valid: boolean, correo: string, message: string}> {
        const forgotPasswordModel = new ForgotPasswordModel(this.correo);
        return await forgotPasswordModel.validateTokenPasswordReset(token);
    }

    async resetPassword(token: string, newPassword: string) : Promise<{success: boolean, message: string}> {
        const forgotPasswordModel = new ForgotPasswordModel(this.correo);
        return await forgotPasswordModel.resetPassword(token, newPassword);
    }
}