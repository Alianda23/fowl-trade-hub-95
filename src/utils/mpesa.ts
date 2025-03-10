
// Utility functions for M-Pesa integration

/**
 * Initiates an M-Pesa STK push to the provided phone number
 * 
 * @param phoneNumber The phone number to send the STK push to (format: 254XXXXXXXXX)
 * @param amount Amount to be paid
 * @returns Promise with the payment response
 */
export const initiateSTKPush = async (phoneNumber: string, amount: number): Promise<{
  success: boolean;
  message: string;
  checkoutRequestID?: string;
  error?: any;
}> => {
  try {
    // Format phone number - ensure it starts with 254
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedPhone = '254' + phoneNumber.substring(1);
    }
    
    console.log(`Initiating STK push to ${formattedPhone} for amount ${amount}`);
    
    // Call backend endpoint to initiate STK push
    const response = await fetch('http://localhost:5000/api/mpesa/stkpush', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        amount: amount
      }),
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('M-Pesa API response:', data);
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${response.status}`,
        error: data
      };
    }
    
    return {
      success: data.success,
      message: data.message || 'STK push initiated successfully',
      checkoutRequestID: data.checkoutRequestID
    };
  } catch (error) {
    console.error('M-Pesa STK push error:', error);
    return {
      success: false,
      message: 'Failed to initiate payment. Please try again.',
      error: error
    };
  }
};

/**
 * Checks the status of an M-Pesa payment
 * 
 * @param checkoutRequestID ID from the STK push request
 * @returns Promise with the payment status
 */
export const checkPaymentStatus = async (checkoutRequestID: string): Promise<{
  success: boolean;
  status: 'pending' | 'completed' | 'failed';
  message: string;
}> => {
  try {
    const response = await fetch(`http://localhost:5000/api/mpesa/status/${checkoutRequestID}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    return {
      success: data.success,
      status: data.status || 'pending',
      message: data.message || 'Payment status check completed'
    };
  } catch (error) {
    console.error('M-Pesa status check error:', error);
    return {
      success: false,
      status: 'pending',
      message: 'Failed to check payment status'
    };
  }
};
