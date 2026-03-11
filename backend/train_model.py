import pandas as pd
import numpy as np
import pickle
import xgboost as xgb
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import sys

# --- Main Training Script ---
if __name__ == "__main__":
    print("🚀 Starting model training and optimization process...")

    # Step 1: Load the dataset
    print("Step 1/7: Loading data from 'menstrual_cycle_dataset_with_factors.csv'...")
    try:
        df = pd.read_csv('menstrual_cycle_dataset_with_factors.csv')
        print(f"✅ Successfully loaded dataset with {len(df)} samples.")
    except FileNotFoundError:
        print("❌ Error: 'menstrual_cycle_dataset_with_factors.csv' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        sys.exit(1)

    # Step 2: Define features and target
    try:
        X = df.drop('Cycle Length', axis=1)
        y = df['Cycle Length']
    except KeyError:
        print("❌ Error: 'Cycle Length' column not found in dataset.")
        sys.exit(1)

    # Step 3: Split data
    print("Step 2/7: Splitting data into training and testing sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print("✅ Data split complete.")

    # Step 4: Preprocessing
    print("Step 3/7: Setting up preprocessing pipeline...")
    categorical_features = X.select_dtypes(include=['object']).columns.tolist()
    numeric_features = X.select_dtypes(include=[np.number]).columns.tolist()
    print(f"📋 Categorical features: {categorical_features}")
    print(f"📊 Numerical features: {numeric_features}")

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ]
    )
    print("✅ Preprocessor configured.")

    # Step 5: Define base XGBoost model
    print("Step 4/7: Defining base XGBoost Regressor...")
    base_model = xgb.XGBRegressor(
        objective='reg:squarederror',
        random_state=42,
        n_jobs=-1
    )

    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', base_model)
    ])

    # Step 6: Hyperparameter optimization
    print("Step 5/7: Running hyperparameter optimization (this may take a few minutes)...")

    param_grid = {
        'regressor__n_estimators': [100, 200, 300, 500],
        'regressor__learning_rate': [0.01, 0.05, 0.1, 0.2],
        'regressor__max_depth': [3, 5, 7, 9],
        'regressor__subsample': [0.6, 0.8, 1.0],
        'regressor__colsample_bytree': [0.6, 0.8, 1.0],
        'regressor__gamma': [0, 0.1, 0.3, 0.5],
        'regressor__reg_lambda': [0.1, 1, 10],
        'regressor__reg_alpha': [0, 0.1, 0.5]
    }

    search = RandomizedSearchCV(
        model_pipeline,
        param_distributions=param_grid,
        n_iter=20,
        scoring='r2',
        cv=5,
        verbose=1,
        random_state=42,
        n_jobs=-1
    )

    try:
        search.fit(X_train, y_train)
        print("✅ Hyperparameter optimization complete.")
        print(f"🏆 Best Parameters Found: {search.best_params_}")
    except Exception as e:
        print(f"❌ Error during optimization: {e}")
        sys.exit(1)

    # Step 7: Evaluate best model
    best_model = search.best_estimator_
    print("📊 Evaluating best model on test data...")
    predictions = best_model.predict(X_test)

    mse = mean_squared_error(y_test, predictions)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    accuracy = 100 * (1 - (mae / np.mean(y_test)))

    print("\n📈 Model Performance Metrics:")
    print(f"   • Mean Squared Error (MSE): {mse:.4f}")
    print(f"   • Mean Absolute Error (MAE): {mae:.4f}")
    print(f"   • Approx. Accuracy: {accuracy:.2f}%")

    # Step 8: Save trained pipeline
    print("\nStep 7/7: Saving optimized model to 'period_model_pipeline.pkl'...")
    try:
        with open('period_model_pipeline.pkl', 'wb') as f:
            pickle.dump(best_model, f)
        print("\n🎉 Success! The optimized model has been saved as 'period_model_pipeline.pkl'.")
        print("You can now use this file in your FastAPI backend for predictions.")
    except Exception as e:
        print(f"❌ Error saving model: {e}")
        sys.exit(1)
