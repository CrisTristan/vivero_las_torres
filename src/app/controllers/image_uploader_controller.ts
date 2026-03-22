import { ImageUploaderService } from "../services/image-uploader-service";

export class ImageUploaderController {

    // private imageUploaderService = inject(ImageUploaderService);

    constructor(private imageUploaderService: ImageUploaderService) {}

    async onCreateImageFileSelected(file: File, folder: string): Promise<string | null> {
        if (!file) {
            return null;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            console.error("Formato no permitido. Solo se aceptan archivos JPG, JPEG, PNG y WEBP.");
            return null;
        }

        const sanitizedFolder = this.sanitizeFolderPath(folder);

        this.imageUploaderService.setFileImage = file; //modificamos el servicio para almacenar el archivo seleccionado
        this.imageUploaderService.setFolder = sanitizedFolder;  //modificamos el servicio para almacenar la carpeta seleccionada

        console.log("Selected file:", file);
        console.log("Upload folder:", sanitizedFolder);

        try {
            const formData = new FormData();
            formData.append("imageFile", file);
            formData.append("folder", sanitizedFolder);

            const response = await fetch("http://localhost:3000/images/uploadImageCloud", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`Error uploading image: ${response.status} - ${responseText}`);
            }

            const data: {
                imageUrl?: string;
                publicId?: string;
                originalName?: string;
                size?: number;
                type?: string;
            } = await response.json();
            const uploadedUrl = data.imageUrl ?? null;

            if (!uploadedUrl) {
                throw new Error("La respuesta del servidor no contiene la URL de la imagen.");
            }

            console.log("Image uploaded successfully:", data);
            this.imageUploaderService.setImageUrl = uploadedUrl;
            return uploadedUrl;
        } catch (error) {
            console.error("Error processing the image:", error);
            return null;
        }
    }

    private sanitizeFolderPath(folder: string): string {
        return folder
            .split('/')
            .map((segment) =>
                segment
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_-]/g, ''),
            )
            .filter((segment) => segment.length > 0)
            .join('/');
    }
}