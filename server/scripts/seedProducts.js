import { dummyProducts } from "../assets/assets.js";
import Product from "../models/product.js"
import { v2 as cloudinary } from "cloudinary";
import path from "path";

export const seedProducts=async()=>{
    const existingProducts=await Product.countDocuments();
    if(existingProducts===0){
        try {
           const allProduct=dummyProducts;
           for(let item of allProduct){
            let productData={
                name:item.name,
                description:item.description,
                price:item.price,
                offerPrice:item.offerPrice,
                category:item.category,
            }
            const images=item.image;
            let imagesUrl=await Promise.all(
                images.map(async(img)=>{
                    // Resolve absolute path
                    const absolutePath = path.resolve("assets", img);
                    // Upload to Cloudinary
                    let result=await cloudinary.uploader.upload(absolutePath,{resource_type:"image"});
                    return result.secure_url;
                })
            )
            await Product.create({...productData,image:imagesUrl});
           }
            
        } catch (error) {
            console.log(error.message);
        }
    }
    }