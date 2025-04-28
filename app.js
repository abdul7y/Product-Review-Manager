const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

// Set up port
const PORT = process.env.PORT || 3000;

// EJS configuration
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory reviews array
let reviews = [
    {
        id: 1,
        productName: 'Smartphone XYZ',
        reviewer: 'John Doe',
        reviewText: 'This smartphone has amazing features and an excellent camera. The battery life is impressive, and the design is sleek and modern. Highly recommended for tech enthusiasts.'
    },
    {
        id: 2,
        productName: 'Wireless Headphones',
        reviewer: 'Jane Smith',
        reviewText: 'These headphones provide crystal clear sound quality and are very comfortable to wear for long periods. The noise cancellation feature works perfectly in noisy environments.'
    },
    {
        id: 3,
        productName: 'Smart Watch Pro',
        reviewer: 'Mike Johnson',
        reviewText: 'The Smart Watch Pro has exceeded my expectations. It tracks my fitness activities accurately and has a great battery life. The user interface is intuitive and easy to navigate.'
    }
];

// Function to generate a new ID
const generateId = () => {
    if (reviews.length === 0) return 1;
    return Math.max(...reviews.map(review => review.id)) + 1;
};

// Routes

// 1. Home page with quick review form
app.get('/', (req, res) => {
    res.render('home', { title: 'Product Review Manager' });
});

// 2. Review index page (with optional sorting)
app.get('/reviews', (req, res) => {
    let reviewsToDisplay = [...reviews];
    
    // Check for sort parameter
    if (req.query.sort === 'latest') {
        // For simulation, we'll just reverse the array (assuming newer reviews are at the end)
        reviewsToDisplay.reverse();
    }
    
    res.render('reviews/index', { 
        reviews: reviewsToDisplay, 
        totalReviews: reviews.length,
        title: 'All Reviews'
    });
});

// 3. Form to add a new review
app.get('/reviews/new', (req, res) => {
    res.render('reviews/new', { title: 'Add New Review' });
});

// 4. Add review logic
app.post('/reviews', (req, res) => {
    const { productName, reviewer, reviewText } = req.body;
    const newReview = {
        id: generateId(),
        productName,
        reviewer,
        reviewText
    };
    // Add to the beginning of the array to simulate "latest first"
    reviews.unshift(newReview);
    res.redirect('/reviews');
});

// 5. Review detail page
app.get('/reviews/:id', (req, res) => {
    const { id } = req.params;
    const review = reviews.find(r => r.id === parseInt(id));
    
    if (!review) {
        return res.status(404).send('Review not found');
    }
    
    res.render('reviews/show', { review, title: 'Review Details' });
});

// 6. Edit form page
app.get('/reviews/:id/edit', (req, res) => {
    const { id } = req.params;
    const review = reviews.find(r => r.id === parseInt(id));
    
    if (!review) {
        return res.status(404).send('Review not found');
    }
    
    res.render('reviews/edit', { review, title: 'Edit Review' });
});

// 7. Update review route
app.patch('/reviews/:id', (req, res) => {
    const { id } = req.params;
    const reviewIndex = reviews.findIndex(r => r.id === parseInt(id));
    
    if (reviewIndex === -1) {
        return res.status(404).send('Review not found');
    }
    
    const { productName, reviewer, reviewText } = req.body;
    
    // Update review
    reviews[reviewIndex] = {
        ...reviews[reviewIndex],
        productName,
        reviewer,
        reviewText
    };
    
    res.redirect(`/reviews/${id}`);
});

// 8. Delete review
app.delete('/reviews/:id', (req, res) => {
    const { id } = req.params;
    reviews = reviews.filter(r => r.id !== parseInt(id));
    res.redirect('/reviews');
});

// 9. Route with two parameters (product name and reviewer)
app.get('/reviews/:productName/:reviewer', (req, res) => {
    const { productName, reviewer } = req.params;
    
    // Filter reviews by both product name and reviewer
    const filteredReviews = reviews.filter(
        r => r.productName.toLowerCase() === productName.toLowerCase() && 
             r.reviewer.toLowerCase() === reviewer.toLowerCase()
    );
    
    res.render('reviews/index', { 
        reviews: filteredReviews, 
        totalReviews: filteredReviews.length,
        title: `Reviews for ${productName} by ${reviewer}`,
        filtered: true,
        noReviewsMessage: `No reviews found for ${productName} by ${reviewer}.`
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
