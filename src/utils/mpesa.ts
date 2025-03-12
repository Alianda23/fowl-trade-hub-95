
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
    
    // Call backend endpoint to initiate STK push directly without connectivity check
    const response = await fetch('http://localhost:5000/api/mpesa/stkpush', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        amount: amount
      }),
      credentials: 'include',
      // Add a longer timeout for the API call
      signal: AbortSignal.timeout(30000) // 30 seconds timeout
    });
    
    const data = await response.json();
    console.log('M-Pesa API response:', data);
    
    if (!response.ok) {
      // Extract the most helpful error message for the user
      let errorMessage = data.message || `Request failed with status ${response.status}`;
      
      // Check if details contain a more specific error
      if (data.details && typeof data.details === 'string') {
        try {
          // Try to parse the details if it's a JSON string
          const errorDetails = JSON.parse(data.details);
          if (errorDetails.errorMessage) {
            if (errorDetails.errorMessage.includes('Invalid CallBackURL')) {
              errorMessage = "Payment server configuration error: Invalid callback URL. This is a server configuration issue, not a problem with your phone number or payment details.";
            } else {
              errorMessage = `M-Pesa Error: ${errorDetails.errorMessage}`;
            }
          }
        } catch (e) {
          // If it's not JSON, just use the string
          if (data.details.includes('Invalid CallBackURL')) {
            errorMessage = "Payment server configuration issue: Invalid callback URL. Please contact support.";
          }
        }
      }
      
      return {
        success: false,
        message: errorMessage,
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
    // Check if it's a timeout error
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return {
        success: false,
        message: 'The request to M-Pesa timed out. The service might be experiencing high traffic or connectivity issues.',
        error: error
      };
    }
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      return {
        success: false,
        message: 'Network error when connecting to M-Pesa. Please check your internet connection.',
        error: error
      };
    }
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
      credentials: 'include',
      // Add timeout
      signal: AbortSignal.timeout(15000) // 15 seconds timeout
    });
    
    const data = await response.json();
    
    return {
      success: data.success,
      status: data.status || 'pending',
      message: data.message || 'Payment status check completed'
    };
  } catch (error) {
    console.error('M-Pesa status check error:', error);
    // More specific error messages based on error type
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return {
        success: false,
        status: 'pending',
        message: 'Status check timed out. The M-Pesa service might be experiencing delays.'
      };
    }
    return {
      success: false,
      status: 'pending',
      message: 'Failed to check payment status'
    };
  }
};

/**
 * Checks if the M-Pesa API is accessible
 * 
 * @returns Promise with the connectivity status
 */
export const checkMpesaConnectivity = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await fetch('http://localhost:5000/api/mpesa/check-connectivity', {
      method: 'GET',
      credentials: 'include',
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });
    
    if (!response.ok) {
      return {
        success: false,
        message: `Unable to reach M-Pesa API (Status: ${response.status}). The service might be temporarily unavailable.`
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('M-Pesa connectivity check error:', error);
    return {
      success: false,
      message: 'Could not check M-Pesa API connectivity. Server might be down or unreachable.'
    };
  }
};
