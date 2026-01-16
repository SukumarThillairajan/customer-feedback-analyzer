import React, { useState } from 'react';
import { submitFeedback } from '../services/api';

const VALID_PRODUCTS = ['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Pendants', 'Other'];

const FeedbackForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    rating: '',
    review_text: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitMessage('');
  };

  const handleRatingChange = (value) => {
    setFormData(prev => ({ ...prev, rating: value }));
    if (errors.rating) setErrors(prev => ({ ...prev, rating: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.product_id) {
      newErrors.product_id = 'Please select a product';
    } else if (formData.product_id === 'Other' && !formData.product_name.trim()) {
      newErrors.product_name = 'Please enter the product name';
    }
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Please select a rating between 1 and 5';
    }
    if (!formData.review_text || !formData.review_text.trim()) {
      newErrors.review_text = 'Please enter a review';
    } else if (formData.review_text.length > 5000) {
      newErrors.review_text = 'Review cannot exceed 5000 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      const payload = {
        product_id: formData.product_id === 'Other' ? 'Other' : formData.product_id,
        rating: parseInt(formData.rating, 10),
        review_text: formData.review_text.trim()
      };
      if (formData.product_id === 'Other') payload.product_name = formData.product_name.trim();

      await submitFeedback(payload);

      setSubmitMessage('Feedback submitted successfully.');
      setFormData({ product_id: '', product_name: '', rating: '', review_text: '' });
      setErrors({});
      if (onSubmitSuccess) onSubmitSuccess();

      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (err) {
      console.error('submit error', err);
      const message = (err && err.message) ? err.message : 'Submission failed. Try again.';
      setSubmitMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Submit Feedback</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-1">
            Product *
          </label>
          <select
            id="product_id"
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.product_id ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select a product</option>
            {VALID_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {errors.product_id && <p className="mt-1 text-sm text-red-600">{errors.product_id}</p>}
        </div>

        {formData.product_id === 'Other' && (
          <div>
            <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1">Other product name *</label>
            <input
              id="product_name"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              placeholder="Enter product name"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.product_name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.product_name && <p className="mt-1 text-sm text-red-600">{errors.product_name}</p>}
          </div>
        )}

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
            Rating (1-5) *
          </label>
          <div role="radiogroup" aria-label="Rating" className="flex items-center space-x-2">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={parseInt(formData.rating,10) === star}
                aria-label={`${star} star`}
                onClick={() => handleRatingChange(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`text-3xl focus:outline-none transition-colors duration-150 ${star <= (hoverRating || parseInt(formData.rating || 0)) ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
          {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
        </div>

        <div>
          <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 mb-1">
            Review *
          </label>
          <textarea
            id="review_text"
            name="review_text"
            value={formData.review_text}
            onChange={handleChange}
            rows={4}
            maxLength={5000}
            placeholder="Share your thoughts about the product..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.review_text ? 'border-red-500' : 'border-gray-300'}`}
          />
          <div className="flex justify-between mt-1">
            {errors.review_text ? <p className="text-sm text-red-600">{errors.review_text}</p> : <span />}
            <p className="text-sm text-gray-500">{formData.review_text.length}/5000 characters</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md font-medium text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>

        {submitMessage && (
          <div className={`p-3 rounded-md ${submitMessage.toLowerCase().includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {submitMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default FeedbackForm;
