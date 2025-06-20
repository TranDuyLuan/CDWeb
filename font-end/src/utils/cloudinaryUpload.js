import axios from "axios";

/**
 * Upload 1 file ảnh lên Cloudinary và trả về URL công khai
 * @param {File} file - File ảnh (từ input type="file")
 * @returns {Promise<string>} - URL ảnh trên Cloudinary
 */
export const uploadToCloudinary = async (file) => {
    if (!file) {
        throw new Error("No file provided for upload.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ecommerce_preset");
    formData.append("cloud_name", "ddszsck8o");

    try {
        const response = await axios.post(
            "https://api.cloudinary.com/v1_1/ddszsck8o/image/upload",
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error("❌ Lỗi khi upload ảnh lên Cloudinary:", error);
        throw error;
    }
};
