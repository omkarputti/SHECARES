import joblib
import numpy as np
import skl2onnx
import onnx
from onnx_tf.backend import prepare
import tensorflow as tf

print("Loading the scikit-learn pipeline from 'period_predictor_model.pkl'...")
pipeline = joblib.load('period_predictor_model.pkl')

preprocessor = pipeline.named_steps['preprocessor']
ohe_transformer = preprocessor.named_transformers_['cat']
num_ohe_features = sum(len(cats) for cats in ohe_transformer.categories_)
num_numerical_features = len(preprocessor.named_transformers_['num'].feature_names_in_)
total_features = num_numerical_features + 3
print(f"Model expects {total_features} raw input features.")

from skl2onnx.common.data_types import FloatTensorType, StringTensorType
initial_types = [
    ('Age', FloatTensorType([None, 1])),
    ('BMI', FloatTensorType([None, 1])),
    ('Stress Level', FloatTensorType([None, 1])),
    ('Sleep Hours', FloatTensorType([None, 1])),
    ('Period Length', FloatTensorType([None, 1])),
    ('Exercise Frequency', StringTensorType([None, 1])),
    ('Diet', StringTensorType([None, 1])),
    ('Symptoms', StringTensorType([None, 1]))
]

print("Converting scikit-learn model to ONNX format...")
onnx_model = skl2onnx.convert_sklearn(pipeline, initial_types=initial_types, target_opset=13)

onnx_filename = 'period_predictor.onnx'
with open(onnx_filename, "wb") as f:
    f.write(onnx_model.SerializeToString())
print(f"ONNX model saved as '{onnx_filename}'")

print("Converting ONNX model to TensorFlow SavedModel...")
onnx_model_loaded = onnx.load(onnx_filename)
tf_rep = prepare(onnx_model_loaded)
tf_model_path = 'tf_model'
tf_rep.export_graph(tf_model_path)
print(f"TensorFlow model saved in '{tf_model_path}' directory.")

print("Converting TensorFlow model to TensorFlow Lite...")
converter = tf.lite.TFLiteConverter.from_saved_model(tf_model_path)
converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS, 
    tf.lite.OpsSet.SELECT_TF_OPS 
]
tflite_model = converter.convert()

tflite_filename = 'model.tflite'
with open(tflite_filename, 'wb') as f:
    f.write(tflite_model)

print("-" * 30)
print(f"SUCCESS: TensorFlow Lite model saved as '{tflite_filename}'")
print("You can now copy this file into your Android Studio project's 'assets' folder.")

