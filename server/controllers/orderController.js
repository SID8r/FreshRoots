
import { Order } from "../models/Order.js";
import Product from "../models/product.js";
import stripe from 'stripe'
import User from "../models/user.js";

// Place Order COD : /api/order/cod

export const placeOrderCOD=async(req,res)=>{
    try {
        const {userId,items,address}=req.body;
        if(!address || items.length===0){
            return res.json({success:false,message:"Invalid data"});
        }
        // Calc the total amount 
        let amount=await items.reduce(async(acc,item)=>{
            const product=await Product.findById(item.product);
            return (await acc)+product.offerPrice*item.quantity;},0);
        // Tax 2% 
        amount +=Math.floor(amount*0.02);

        await Order.create({
            userId,items,amount,address,paymentType:"COD",
        });
        return res.json({success:true,message:"Order Placed Succesfully"});
    } catch (error) {
        console.log(error.message);
        res.json({success:false ,message:error.message}); 
    }
}

// Place order Stripe 

export const placeOrderStripe=async(req,res)=>{
    try {
        const {userId,items,address}=req.body;
        const {origin}=req.headers;
        if(!address || items.length===0){
            return res.json({success:false,message:"Invalid data"});
        }

        let productData=[];

        // Calc the total amount 
        let amount=await items.reduce(async(acc,item)=>{
            const product=await Product.findById(item.product);
            productData.push({
                name:product.name,
                price:product.offerPrice,
                quantity:item.quantity,
            });
            return (await acc)+product.offerPrice*item.quantity;},0);
        // Tax 2% 
        amount +=Math.floor(amount*0.02);

        const order =await Order.create({
            userId,items,amount,address,paymentType:"Online",
        });

        // Stripe gateway intialized

            const stripeInstance =new stripe(process.env.STRIPE_SECRET_KEY);

        // Create line_items for stripe 
            
            const line_items=productData.map((item)=>{
                return{
                    price_data:{
                        currency:"usd",
                        product_data:{
                            name:item.name,
                        },
                        unit_amount:Math.floor(item.price+item.price*0.02)*100,
                    },
                    quantity:item.quantity,
                }
            });

        // Create session

            const session =await stripeInstance.checkout.sessions.create({
                line_items,
                mode:"payment",
                success_url:`${origin}/loader?next=my-orders`,
                cancel_url:`${origin}/cart`,
                metadata:{
                    orderId:order._id.toString(),
                    userId,
                }

            })

        return res.json({success:true,url:session.url});
    } catch (error) {
        console.log(error.message);
        res.json({success:false ,message:error.message}); 
    }
}

// Stripe Webhooks to verify payments actions :/stripe

export const stripeWebhooks=async(req,res)=>{
    // Stripe intialise 
    const stripeInstance =new stripe(process.env.STRIPE_SECRET_KEY);
    
    const sig=req.headers['stripe-signature'];
    let event;
    try {
        event=stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET,
        )
    } catch (error) {
        res.status(400).send(`Webhook Error ${error.message}`);
    }

    // Handle Events
    switch (event.type) {
        case 'payment_intent.succeeded':{
            const paymentIntent=event.data.object;
            const paymentIntentId=paymentIntent.id;
        

        // Getting session metadata
        const session=await stripeInstance.checkout.sessions.list({
            payment_intent:paymentIntentId,
        })
        const {orderId,userId}=session.data[0].metadata;
        // Marks payment as paid
        await Order.findByIdAndUpdate(orderId,{isPaid:true});

        // Clear the Cart

        await User.findByIdAndUpdate(userId,{cartItems:{}});
        break;
        }
        case 'payment_intent.payment_failed':{
            const paymentIntent=event.data.object;
            const paymentIntentId=paymentIntent.id;
        

        // Getting session metadata
        const session=await stripeInstance.checkout.sessions.list({
            payment_intent:paymentIntentId,
        })
        const {orderId}=session.data[0].metadata;
        await Order.findByIdAndDelete(orderId);
        break;
        }
        default:{
            console.error(`Unhandled event type ${event.type}`);
            res.json({recevied:true});
            break;
        }
           
    }
}



// Get Order by userId : /api/order/user

export const getUserOrders=async(req,res)=>{
    try {
        const userId=req.userId;


        const orders=await Order.find({
            userId,
            $or:[{paymentType:"COD"},
        {isPaid:true}]
        }).populate("items.product address").sort({createdAt:-1});


        return res.json({success:true,orders});
    } catch (error) {
        console.log(error.message);
        res.json({success:false ,message:error.message}); 
    }
}

// Get all orders (seller) : /api/order/seller

export const getAllOrders=async(req,res)=>{
    try {
        const orders=await Order.find({
            $or:[{paymentType:"COD"},
        {isPaid:true}]
        }).populate("items.product address").sort({createdAt:-1});


        return res.json({success:true,orders});
    } catch (error) {
        console.log(error.message);
        res.json({success:false ,message:error.message}); 
    }
}