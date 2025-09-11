const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface DueDateRequest {
  lmp_date: string;
}

export interface SimplePeriodRequest {
  last_period_date: string;
  cycle_length: number;
}

export interface AdvancedPeriodRequest {
  last_period_date: string;
  age: number;
  bmi: number;
  stress_level: number;
  sleep_hours: number;
  period_length: number;
  exercise_freq: 'Low' | 'Moderate' | 'High';
  diet: 'Balanced' | 'Vegetarian' | 'High Sugar' | 'Low Carb';
  symptoms: 'Cramps' | 'Mood Swings' | 'Fatigue' | 'Headache' | 'Bloating';
}

export interface ChatbotRequest {
  user_input: string;
}

export const apiService = {
  async calculateDueDate(data: DueDateRequest) {
    const response = await fetch(`${API_BASE_URL}/calculate-due-date`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'An unknown API error occurred.');
  }

  return response.json();
},

  async predictPeriodSimple(data: SimplePeriodRequest) {
    const response = await fetch(`${API_BASE_URL}/predict-period/simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async chatWithText(message: string) {
    const formData = new FormData();
    formData.append('message', message);

    const response = await fetch(`${API_BASE_URL}/chat/text`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'An API error occurred.');
    }

    return response.json();
  },

  async predictPeriodAdvanced(data: AdvancedPeriodRequest) {
    const response = await fetch(`${API_BASE_URL}/predict-period/advanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async predictOvulationSimple(data: SimplePeriodRequest) {
    const response = await fetch(`${API_BASE_URL}/predict-ovulation/simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async predictOvulationAdvanced(data: AdvancedPeriodRequest) {
    const response = await fetch(`${API_BASE_URL}/predict-ovulation/advanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getChatbotResponse(data: ChatbotRequest) {
    const response = await fetch(`${API_BASE_URL}/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};