const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId.js");
const { generateRefreshToken } = require("../config/refreshtoken");
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const sendEmail = require("./emailCtrl");

// Create a User
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        // Create new User
        const newUser = await User.create(req.body);
        res.json(newUser);
    }
    else {
        // User Already Exists
        throw new Error("User Already Exists");
    }
});

// Login a User
const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // check if user exists or not 
    const findUser = await User.findOne({ email });
    if (findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true,
            }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        });
    } else {
        throw new Error("Invalid Credentials");
    }
});

// Admin Login
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // check if user exists or not 
    const findAdmin = await User.findOne({ email });
    if (findAdmin.role !== "admin") throw new Error("Not Authorized");
    if (findAdmin && await findAdmin.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateuser = await User.findByIdAndUpdate(
            findAdmin.id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true,
            }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id)
        });
    } else {
        throw new Error("Invalid Credentials");
    }
});

// HandlerefreshToken
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No Refresh Token in cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error('No Refresh Token present in db or not matched');
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error('There is something wrong with refresh token');
        }
        const accessToken = generateToken(user?._id);
        res.json({ accessToken });
    });
});

// Logout a User
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No Refresh Token in cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204); //forbidden
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: "",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });
    res.sendStatus(204); //forbidden
});

// Update a User 
const updateaUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const updateaUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile
        }, {
            new: true,
        });
        res.json(updateaUser);
    }
    catch (error) {
        throw new Error(error);
    }
});

// Save user Address
const saveAddress = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const updateaUser = await User.findByIdAndUpdate(_id, {
            address: req?.body?.address,
        }, {
            new: true,
        });
        res.json(updateaUser);
    }
    catch (error) {
        throw new Error(error);
    }
});

// Get all users
const getallUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    }
    catch (error) {
        throw new Error(error);
    }
});

// Get a single user
const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getaUser = await User.findById(id);
        res.json({ getaUser });
    }
    catch (error) {
        throw new Error(error);
    }
});

// delete a single user
const deleteaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deleteaUser = await User.findByIdAndDeletek(id);
        res.json({ deleteaUser });
    }
    catch (error) {
        throw new Error(error);
    }
});

// Block a User
const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const block = await User.findByIdAndUpdate(id,
            {
                isBlocked: true,
            },
            {
                new: true,
            });
        res.json({
            message: "User Blocked",
        });
    } catch (error) {
        throw new Error(error);
    }
});
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const unblock = await User.findByIdAndUpdate(id,
            {
                isBlocked: false,
            },
            {
                new: true,
            });
        res.json({
            message: "User Unblocked",
        });
    } catch (error) {
        throw new Error(error);
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongodbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email.");
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow the link to reset your password. This link is valid till 10 minutes. <a href='http://localhost:3000/reset-password/${token}'>Click here </a>`
        const data = {
            to: email,
            text: "Hey User",
            subject: "Forgot Password Link",
            htm: resetURL,
        };
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Token expired, Please try again later.");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});

const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    try {
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);
    } catch (error) {
        throw new Error(error);
    }
});

const userCart = asyncHandler(async (req, res) => {
    const { productId, color, quantity, price } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    try {

        let newCart = await new Cart({
            userId: _id,
            productId,
            color,
            quantity,
            price,
        }).save();
        res.json(newCart);
    } catch (error) {
        throw new Error(error);
    }
});

const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const cart = await Cart.find({ userId: _id }).populate("productId").populate("color");
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

const removeProductFromCart  = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { cartItemId } = req.params;
    validateMongodbId(_id);
    try {
        const deleteProductFromCart = await Cart.deleteOne({ userId: _id, _id: cartItemId });
        res.json(deleteProductFromCart);
    } catch (error) {
        throw new Error(error);
    }
});

const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const deleteCart = await Cart.deleteMany({ userId: _id});
        res.json(deleteCart);
    } catch (error) {
        throw new Error(error);
    }
});

const updateProductQuantityFromCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { cartItemId, newQuantity } = req.params;
    validateMongodbId(_id);
    try {
        const cartItem = await Cart.findOne({ userId: _id, _id: cartItemId });
        cartItem.quantity = newQuantity;
        cartItem.save();
        res.json(cartItem);
    } catch (error) {
        throw new Error(error);
    }
});

const createOrder = asyncHandler(async (req, res) => {
    const { shippingInfo, orderItems, totalPrice, totalPriceAfterDiscount, paymentInfo } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const order = await Order.create({
            shippingInfo,
            orderItems,
            totalPrice,
            totalPriceAfterDiscount,
            paymentInfo,
            user: _id,
        });
        res.json({
            order,
            success: true,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getAllOrders = asyncHandler(async (req, res) => {
    try {
        const alluserorders = await Order.find().populate("user");
        res.json(alluserorders);
    } catch (error) {
        throw new Error(error);
    }
});

const getSingleOrders = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const userorders = await Order.findOne({ _id: id }).populate("orderItems.product").populate("orderItems.color").exec();
        res.json(userorders);
    } catch (error) {
        throw new Error(error);
    }
});

const updateOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const orders = await Order.findById(id);
        orders.orderStatus=req.body.status;
        await orders.save();
        res.json(orders);
    } catch (error) {
        throw new Error(error);
    }
});

const getMyOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const orders = await Order.find({ user: _id }).populate("user").populate("orderItems.product").populate("orderItems.color");
        res.json({
            orders
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
    let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let d = new Date();
    let endDate = "";
    d.setDate(1)
    for (let index = 0; index < 11; index++) {
        d.setMonth(d.getMonth() - 1)
        endDate = monthNames[d.getMonth()] + " " + d.getFullYear()
    }
    const data = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $lte: new Date(),
                    $gte: new Date(endDate)
                }
            }
        }, {
            $group: {
                _id: { month: "$month" },
                amount: { $sum: "$totalPriceAfterDiscount" },
                count: { $sum: 1 }
            }
        }
    ]);
    res.json(data);
});

const getYearlyTotalOrders = asyncHandler(async (req, res) => {
    let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let d = new Date();
    let endDate = "";
    d.setDate(1)
    for (let index = 0; index < 11; index++) {
        d.setMonth(d.getMonth() - 1)
        endDate = monthNames[d.getMonth()] + " " + d.getFullYear()
    }
    const data = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $lte: new Date(),
                    $gte: new Date(endDate)
                }
            }
        }, {
            $group: {
                _id: null,
                count: { $sum: 1 },
                amount: { $sum: "$totalPriceAfterDiscount" },
            }
        }
    ]);
    res.json(data);
});

module.exports = {
    createUser,
    loginUserCtrl,
    loginAdmin,
    getallUser,
    getaUser,
    deleteaUser,
    updateaUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    removeProductFromCart,
    emptyCart,
    updateProductQuantityFromCart,
    createOrder,
    getMyOrders,
    getMonthWiseOrderIncome,
    getYearlyTotalOrders,
    getAllOrders,
    getSingleOrders,
    updateOrder,
};