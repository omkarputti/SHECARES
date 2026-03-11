// src/services/api.ts

// Dynamically detect backend base URL from device or use .env if provided
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

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
  // ✅ Calculate pregnancy due date
  async calculateDueDate(data: DueDateRequest) {
    const response = await fetch(`${API_BASE_URL}/calculate-due-date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to calculate due date.');
    }

    return response.json();
  },

  // ✅ Predict period (simple)
  async predictPeriodSimple(data: SimplePeriodRequest) {
    const response = await fetch(`${API_BASE_URL}/predict-period/simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to predict simple period.');
    return response.json();
  },

  // ✅ Predict period (advanced)
  async predictPeriodAdvanced(data: AdvancedPeriodRequest) {
    const response = await fetch(`${API_BASE_URL}/predict-period/advanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to predict advanced period.');
    return response.json();
  },

  // ✅ Predict ovulation (simple)
  async predictOvulationSimple(data: SimplePeriodRequest) {
    const response = await fetch(`${API_BASE_URL}/predict-ovulation/simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to predict simple ovulation.');
    return response.json();
  },

  // ✅ Predict ovulation (advanced)
  async predictOvulationAdvanced(data: AdvancedPeriodRequest) {
    const response = await fetch(`${API_BASE_URL}/predict-ovulation/advanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to predict advanced ovulation.');
    return response.json();
  },

  // ✅ Text-based chatbot (used by MentalWellness)
  async chatWithText(message: string) {
    const formData = new FormData();
    formData.append('message', message);

    const response = await fetch(`http://0.0.0.0:8003/text`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to connect to chatbot.');
    }

    return response.json();
  },

  // ✅ JSON-based chatbot (alternative endpoint)
  async getChatbotResponse(data: ChatbotRequest) {
    const response = await fetch(`${API_BASE_URL}/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to get chatbot response.');
    return response.json();
  },
};
