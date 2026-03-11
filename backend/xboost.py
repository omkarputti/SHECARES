import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, accuracy_score, classification_report
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# DATA LOADING AND PREPROCESSING
# ============================================================================

def load_and_preprocess_menstrual_data(filepath):
    """Load and preprocess menstrual cycle dataset"""
    print("Loading menstrual cycle dataset...")
    df = pd.read_csv(filepath)
    
    # Convert date columns to datetime
    df['Cycle Start Date'] = pd.to_datetime(df['Cycle Start Date'])
    df['Next Cycle Start Date'] = pd.to_datetime(df['Next Cycle Start Date'])
    
    # Extract date features
    df['Start_Month'] = df['Cycle Start Date'].dt.month
    df['Start_Day'] = df['Cycle Start Date'].dt.day
    df['Start_DayOfWeek'] = df['Cycle Start Date'].dt.dayofweek
    
    # Encode categorical variables
    le_exercise = LabelEncoder()
    le_diet = LabelEncoder()
    le_symptoms = LabelEncoder()
    
    df['Exercise_Encoded'] = le_exercise.fit_transform(df['Exercise Frequency'])
    df['Diet_Encoded'] = le_diet.fit_transform(df['Diet'])
    df['Symptoms_Encoded'] = le_symptoms.fit_transform(df['Symptoms'])
    
    print(f"Menstrual dataset shape: {df.shape}")
    print(f"Unique symptoms: {df['Symptoms'].nunique()}")
    
    return df, le_exercise, le_diet, le_symptoms

def load_and_preprocess_disease_data(filepath):
    """Load and preprocess disease symptoms dataset"""
    print("\nLoading disease symptoms dataset...")
    df = pd.read_csv(filepath)
    
    # First column is the disease name
    disease_col = df.columns[0]
    
    # Separate disease labels and symptom features
    diseases = df[disease_col]
    symptoms = df.drop(columns=[disease_col])
    
    # Filter out diseases with less than 2 samples (needed for stratified split)
    disease_counts = diseases.value_counts()
    valid_diseases = disease_counts[disease_counts >= 2].index
    
    # Create mask for valid diseases
    mask = diseases.isin(valid_diseases)
    diseases = diseases[mask]
    symptoms = symptoms[mask]
    
    print(f"Filtered out {(~mask).sum()} samples with single-instance diseases")
    
    # Encode disease labels
    le_disease = LabelEncoder()
    disease_encoded = le_disease.fit_transform(diseases)
    
    print(f"Disease dataset shape after filtering: {symptoms.shape}")
    print(f"Number of diseases: {len(le_disease.classes_)}")
    print(f"Number of symptom features: {symptoms.shape[1]}")
    
    return symptoms, disease_encoded, le_disease, diseases

# ============================================================================
# MODEL TRAINING FUNCTIONS
# ============================================================================

def train_menstrual_cycle_predictor(df):
    """Train Random Forest model to predict cycle length"""
    print("\n" + "="*70)
    print("TRAINING MENSTRUAL CYCLE LENGTH PREDICTOR")
    print("="*70)
    
    # Features for prediction
    feature_cols = ['Age', 'BMI', 'Stress Level', 'Sleep Hours', 
                    'Exercise_Encoded', 'Diet_Encoded', 'Period Length',
                    'Start_Month', 'Start_DayOfWeek']
    
    X = df[feature_cols]
    y = df['Cycle Length']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest model with better parameters
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=None,  # No limit on depth
        min_samples_split=2,
        min_samples_leaf=1,
        max_features='sqrt',
        bootstrap=True,
        random_state=42,
        n_jobs=-1
    )
    
    print("\nTraining model...")
    model.fit(X_train_scaled, y_train)
    
    # Predictions
    y_pred = model.predict(X_test_scaled)
    
    # Evaluation
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n📊 Model Performance:")
    print(f"   Mean Squared Error: {mse:.4f}")
    print(f"   Mean Absolute Error: {mae:.4f}")
    print(f"   R² Score: {r2:.4f}")
    
    # Feature importance
    print("\n📈 Top 5 Important Features:")
    feature_importance = pd.DataFrame({
        'Feature': feature_cols,
        'Importance': model.feature_importances_
    }).sort_values('Importance', ascending=False)
    print(feature_importance.head().to_string(index=False))
    
    return model, scaler, feature_cols, feature_importance

def train_period_length_predictor(df):
    """Train Random Forest model to predict period length"""
    print("\n" + "="*70)
    print("TRAINING PERIOD LENGTH PREDICTOR")
    print("="*70)
    
    feature_cols = ['Age', 'BMI', 'Stress Level', 'Sleep Hours', 
                    'Exercise_Encoded', 'Diet_Encoded', 'Cycle Length',
                    'Start_Month', 'Start_DayOfWeek']
    
    X = df[feature_cols]
    y = df['Period Length']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        max_features='sqrt',
        bootstrap=True,
        random_state=42,
        n_jobs=-1
    )
    
    print("\nTraining model...")
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n📊 Model Performance:")
    print(f"   Mean Squared Error: {mse:.4f}")
    print(f"   Mean Absolute Error: {mae:.4f}")
    print(f"   R² Score: {r2:.4f}")
    
    return model, scaler, feature_cols

def train_symptom_predictor(df):
    """Train Random Forest model to predict symptoms"""
    print("\n" + "="*70)
    print("TRAINING SYMPTOM PREDICTOR")
    print("="*70)
    
    feature_cols = ['Age', 'BMI', 'Stress Level', 'Sleep Hours', 
                    'Exercise_Encoded', 'Diet_Encoded', 'Cycle Length',
                    'Period Length', 'Start_Month', 'Start_DayOfWeek']
    
    X = df[feature_cols]
    y = df['Symptoms_Encoded']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        max_features='sqrt',
        bootstrap=True,
        random_state=42,
        n_jobs=-1
    )
    
    print("\nTraining model...")
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n📊 Model Accuracy: {accuracy:.4f}")
    
    return model, scaler, feature_cols

def train_disease_classifier(X_symptoms, y_disease):
    """Train Random Forest model to classify diseases from symptoms"""
    print("\n" + "="*70)
    print("TRAINING DISEASE CLASSIFIER")
    print("="*70)
    
    # Check class distribution
    unique, counts = np.unique(y_disease, return_counts=True)
    print(f"\nClass distribution: {len(unique)} classes")
    print(f"Min samples per class: {counts.min()}")
    print(f"Max samples per class: {counts.max()}")
    print(f"Total samples: {len(y_disease)}")
    
    # Split without stratification if there are classes with few samples
    X_train, X_test, y_train, y_test = train_test_split(
        X_symptoms, y_disease, test_size=0.2, random_state=42
    )
    
    # Use fewer trees and limit depth to reduce memory usage
    model = RandomForestClassifier(
        n_estimators=100,  # Reduced from 400
        max_depth=20,      # Limited depth
        min_samples_split=10,  # Require more samples to split
        min_samples_leaf=5,    # Require more samples in leaves
        max_features='sqrt',
        bootstrap=True,
        random_state=42,
        n_jobs=2,  # Reduced from -1 to limit parallel processes
        max_samples=0.7,  # Use only 70% of data per tree
        class_weight='balanced'
    )
    
    print("\nTraining model (this may take a few minutes)...")
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n📊 Model Accuracy: {accuracy:.4f}")
    
    # Skip cross-validation to save memory
    print("   (Cross-validation skipped to conserve memory)")
    
    return model, X_train, X_test, y_train, y_test

# ============================================================================
# VISUALIZATION FUNCTIONS
# ============================================================================

def plot_feature_importance(importance_df, title):
    """Plot feature importance"""
    plt.figure(figsize=(10, 6))
    top_features = importance_df.head(10)
    colors = plt.cm.viridis(np.linspace(0, 1, len(top_features)))
    plt.barh(top_features['Feature'], top_features['Importance'], color=colors)
    plt.xlabel('Importance', fontsize=12)
    plt.ylabel('Features', fontsize=12)
    plt.title(title, fontsize=14, fontweight='bold')
    plt.gca().invert_yaxis()
    plt.tight_layout()
    filename = f'{title.replace(" ", "_")}.png'
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"\n✅ Saved: {filename}")

def plot_predictions_vs_actual(y_test, y_pred, title):
    """Plot predictions vs actual values"""
    plt.figure(figsize=(10, 6))
    plt.scatter(y_test, y_pred, alpha=0.6, c=y_pred, cmap='viridis', edgecolors='k', linewidth=0.5)
    
    # Perfect prediction line
    min_val = min(y_test.min(), y_pred.min())
    max_val = max(y_test.max(), y_pred.max())
    plt.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label='Perfect Prediction')
    
    plt.xlabel('Actual Values', fontsize=12)
    plt.ylabel('Predicted Values', fontsize=12)
    plt.title(title, fontsize=14, fontweight='bold')
    plt.legend()
    plt.colorbar(label='Predicted Value')
    plt.tight_layout()
    filename = f'{title.replace(" ", "_")}.png'
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"✅ Saved: {filename}")

def plot_model_comparison(results_dict):
    """Plot comparison of all models"""
    plt.figure(figsize=(12, 6))
    
    models = list(results_dict.keys())
    scores = list(results_dict.values())
    
    colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12']
    bars = plt.bar(models, scores, color=colors, edgecolor='black', linewidth=1.5)
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.3f}',
                ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    plt.ylabel('Score (R² / Accuracy)', fontsize=12)
    plt.title('Model Performance Comparison', fontsize=14, fontweight='bold')
    plt.ylim(0, 1.1)
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('Model_Performance_Comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    print(f"✅ Saved: Model_Performance_Comparison.png")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("="*70)
    print("RANDOM FOREST MODEL TRAINING PIPELINE")
    print("="*70)
    
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--skip-disease', action='store_true', 
                       help='Skip disease classifier training to save memory')
    args, unknown = parser.parse_known_args()
    
    # Load and preprocess datasets
    try:
        # Menstrual cycle dataset
        menstrual_df, le_exercise, le_diet, le_symptoms = load_and_preprocess_menstrual_data(
            'menstrual_cycle_dataset_with_factors.csv'
        )
        
        # Train models for menstrual data
        cycle_model, cycle_scaler, cycle_features, cycle_importance = train_menstrual_cycle_predictor(menstrual_df)
        period_model, period_scaler, period_features = train_period_length_predictor(menstrual_df)
        symptom_model, symptom_scaler, symptom_features = train_symptom_predictor(menstrual_df)
        
        # Collect performance metrics for menstrual models
        cycle_pred = cycle_model.predict(cycle_scaler.transform(menstrual_df[cycle_features]))
        cycle_r2 = r2_score(menstrual_df['Cycle Length'], cycle_pred)
        
        period_pred = period_model.predict(period_scaler.transform(menstrual_df[period_features]))
        period_r2 = r2_score(menstrual_df['Period Length'], period_pred)
        
        symptom_pred = symptom_model.predict(symptom_scaler.transform(menstrual_df[symptom_features]))
        symptom_acc = accuracy_score(menstrual_df['Symptoms_Encoded'], symptom_pred)
        
        results = {
            'Cycle Length\n(R²)': cycle_r2,
            'Period Length\n(R²)': period_r2,
            'Symptom Pred\n(Accuracy)': symptom_acc
        }
        
        # Train disease classifier (optional)
        disease_model = None
        disease_acc = None
        
        if not args.skip_disease:
            try:
                print("\n" + "="*70)
                print("Loading disease dataset...")
                print("="*70)
                
                symptoms_X, disease_y, le_disease, disease_labels = load_and_preprocess_disease_data(
                    'Final_Augmented_dataset_Diseases_and_Symptoms.csv'
                )
                
                disease_model, X_train_disease, X_test_disease, y_train_disease, y_test_disease = train_disease_classifier(
                    symptoms_X, disease_y
                )
                
                disease_pred = disease_model.predict(X_test_disease)
                disease_acc = accuracy_score(y_test_disease, disease_pred)
                
                results['Disease Class\n(Accuracy)'] = disease_acc
                
            except MemoryError:
                print("\n⚠️  Memory error occurred during disease classifier training.")
                print("   The disease model will be skipped.")
                print("   You can train it separately with more RAM or use --skip-disease flag")
        else:
            print("\n⚠️  Disease classifier training skipped (--skip-disease flag)")
            le_disease = None
        
        # Visualizations
        print("\n" + "="*70)
        print("GENERATING VISUALIZATIONS")
        print("="*70)
        
        plot_feature_importance(cycle_importance, "Cycle_Length_Feature_Importance")
        plot_model_comparison(results)
        
        # Save models
        print("\n" + "="*70)
        print("SAVING MODELS")
        print("="*70)
        
        import pickle
        
        # Save menstrual models
        with open('cycle_length_model.pkl', 'wb') as f:
            pickle.dump(cycle_model, f)
        with open('period_length_model.pkl', 'wb') as f:
            pickle.dump(period_model, f)
        with open('symptom_predictor_model.pkl', 'wb') as f:
            pickle.dump(symptom_model, f)
        
        print("\n✅ Menstrual models saved successfully!")
        print("   - cycle_length_model.pkl")
        print("   - period_length_model.pkl")
        print("   - symptom_predictor_model.pkl")
        
        # Save disease model if trained
        if disease_model is not None:
            with open('disease_classifier_model.pkl', 'wb') as f:
                pickle.dump(disease_model, f)
            print("   - disease_classifier_model.pkl")
        
        # Save encoders and scalers
        encoders_data = {
            'le_exercise': le_exercise,
            'le_diet': le_diet,
            'le_symptoms': le_symptoms,
            'cycle_scaler': cycle_scaler,
            'period_scaler': period_scaler,
            'symptom_scaler': symptom_scaler,
            'cycle_features': cycle_features,
            'period_features': period_features,
            'symptom_features': symptom_features
        }
        
        if le_disease is not None:
            encoders_data['le_disease'] = le_disease
        
        with open('encoders_scalers.pkl', 'wb') as f:
            pickle.dump(encoders_data, f)
        
        print("\n✅ Encoders and scalers saved to 'encoders_scalers.pkl'")
        
        # Print summary
        print("\n" + "="*70)
        print("TRAINING COMPLETE - SUMMARY")
        print("="*70)
        print(f"\n🎯 Model Performance:")
        print(f"   Cycle Length Predictor (R²):     {cycle_r2:.4f}")
        print(f"   Period Length Predictor (R²):    {period_r2:.4f}")
        print(f"   Symptom Predictor (Accuracy):    {symptom_acc:.4f}")
        if disease_acc is not None:
            print(f"   Disease Classifier (Accuracy):   {disease_acc:.4f}")
        
        print(f"\n📊 Visualizations Generated:")
        print(f"   - Cycle_Length_Feature_Importance.png")
        print(f"   - Model_Performance_Comparison.png")
        
        print("\n" + "="*70)
        
    except FileNotFoundError as e:
        print(f"\n❌ Error: Could not find dataset file.")
        print(f"   Please ensure the following files exist:")
        print(f"   - menstrual_cycle_dataset_with_factors.csv")
        print(f"   - Final_Augmented_dataset_Diseases_and_Symptoms.csv")
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()