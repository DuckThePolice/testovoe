import cloudinary from "cloudinary";

export class Cloud {
  cloud = cloudinary.v2;

  constructor() {
    this.cloud.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });
  }
  async getImagebyId(id: string) {
    return cloudinary.v2.api.resources_by_asset_ids(id);
  }
  async upload(filePath: string, isVideo: boolean) {
    type resource_type = "auto" | "image" | "video" | "raw" | undefined;
    let res_type: resource_type = "image";
    if (isVideo) res_type = "video";

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      resource_type: res_type,
    };
    try {
      // Upload the image
      const result = await this.cloud.uploader.upload(filePath, options);
      console.log(result);
      return result.public_id;
    } catch (error) {
      console.error(error);
    }
  }

  async getAssetInfo(publicId: string) {
    // Return colors in the response
    const options = {
      colors: true,
    };

    try {
      // Get details about the asset
      const result = await this.cloud.api.resource(publicId, options);
      console.log(result);
      return result.colors;
    } catch (error) {
      console.error(error);
    }
  }
}
