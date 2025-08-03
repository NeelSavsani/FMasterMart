const products = [
    {
        category: "Electronics",
        name: "Premium Wireless Headphones with Noise Cancellation",
        rating: 4,
        ratingCount: 1234,
        price: 8999,
        oldPrice: 12999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Grooming",
        name: "Skincare Kit with Natural Ingredients",
        rating: 3,
        ratingCount: 789,
        price: 2999,
        oldPrice: 4499,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Fashion",
        name: "Organic Cotton Casual T-Shirt for Men",
        rating: 3,
        ratingCount: 432,
        price: 1299,
        oldPrice: 1899,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Photography",
        name: "Professional Camera Lens 50mm f/1.8",
        rating: 3,
        ratingCount: 156,
        price: 25999,
        oldPrice: 30000,
        discount: null,
        outOfStock: true,
    },
    {
        category: "Furniture",
        name: "Ergonomic Office Chair with Lumbar Support",
        rating: 4,
        ratingCount: 678,
        price: 18999,
        oldPrice: 24999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Electronics",
        name: "Bluetooth Portable Speaker Waterproof",
        rating: 4,
        ratingCount: 945,
        price: 3999,
        oldPrice: 5999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Wearables",
        name: "Smart Watch for Men 1.43' True AMOLED",
        rating: 4,
        ratingCount: 1138,
        price: 2999,
        oldPrice: 9999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Electronics",
        name: "Gaming Mechanical Keyboard RGB Backlit",
        rating: 5,
        ratingCount: 523,
        price: 7499,
        oldPrice: 9999,
        discount: null,
        outOfStock: true,
    },
    {
        category: "Fashion",
        name: "Polarized sunglass",
        rating: 5,
        ratingCount: 202,
        price: 6499,
        oldPrice: 7999,
        discount: null,
        outOfStock: true,
    },
    {
        category: "Photography",
        name: "RGB LED Stick Light with 30W Power",
        rating: 4,
        ratingCount: 527,
        price: 4749,
        oldPrice: 5990,
        discount: null,
        outOfStock: true,
    },
    {
        category: "Wearables",
        name: "Smart Fitness Watch with Heart Rate Monitor",
        rating: 4,
        ratingCount: 856,
        price: 15999,
        oldPrice: 19999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Electronics",
        name: "Ergonomic gaming mouse",
        rating: 4,
        ratingCount: 600,
        price: 6999,
        oldPrice: 9999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false
    },
    {
        category: "Furniture",
        name: "Laptop Stand with 360° Rotating Base",
        rating: 4.5,
        ratingCount: 1691,
        price: 1899,
        oldPrice: 3899,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },

    {
        category: "Grooming",
        name: "Coconut Milk & Peptides strength & shine shampoo",
        rating: 4,
        ratingCount: 2599,
        price: 315,
        oldPrice: 349,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Fashion",
        name: "Women's Georgette Embroidered Sequence Work Long Sleeve Round Nack Gown",
        rating: 4,
        ratingCount: 34,
        price: 979,
        oldPrice: 1199,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Photography",
        name: "LED Video Light for Phone, Camera, Laptop",
        rating: 4,
        ratingCount: 194,
        price: 699,
        oldPrice: 1999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false
    }
];