/**
 * Utility functions for handling payments
 */

/**
 * Stores payment details in the database
 * @param paymentDetails Payment details to store
 * @returns Promise with the result of the operation
 */
export async function storePaymentDetails(paymentDetails: {
  name: string;
  email: string;
  paymentId: string;
  amount: number;
  orderId?: string;
  currency?: string;
}) {
  try {
    console.log('Storing payment details:', paymentDetails);

    // Call the API to store payment details
    const response = await fetch('/api/payment/store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentDetails),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to store payment details: ${response.status}`);
    }

    const result = await response.json();
    console.log('Payment details stored successfully:', result);

    return result;
  } catch (error: any) {
    console.error('Error storing payment details:', error);
    throw error;
  }
}

/**
 * Handles successful payment
 * @param paymentData Payment data from payment gateway
 * @returns Promise with the result of the operation
 */
export async function handlePaymentSuccess(paymentData: any) {
  try {
    console.log('Handling successful payment:', paymentData);

    // Extract payment details
    const paymentDetails = {
      name: paymentData.name || paymentData.fullName,
      email: paymentData.email,
      paymentId: paymentData.paymentId || paymentData.razorpayPaymentId,
      amount: paymentData.amount,
      orderId: paymentData.orderId || paymentData.razorpayOrderId,
      currency: paymentData.currency || 'INR'
    };

    // Store payment details
    const result = await storePaymentDetails(paymentDetails);

    // Set subscription status in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasActiveSubscription', 'true');

      // Store payment details in localStorage for the success page
      localStorage.setItem('lastPayment', JSON.stringify(paymentDetails));
    }

    return result;
  } catch (error: any) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}
