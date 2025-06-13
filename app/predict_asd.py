import sys
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Model Definition
def load_model(model_path):
    model = models.resnet18(pretrained=False)
    model.conv1 = nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3, bias=False)  # 1 channel for grayscale
    model.fc = nn.Linear(model.fc.in_features, 2)  # 2 classes: ASD / TD
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()
    return model

# Image preprocessing
def preprocess_image(image_path):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),  # ResNet input size
        transforms.Grayscale(num_output_channels=1),  # Ensure it's 1 channel
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5])
    ])
    image = Image.open(image_path).convert("L")  # Grayscale
    image = transform(image).unsqueeze(0)  # Shape: [1, 1, 224, 224]
    return image.to(device)

def predict(image_path, model_path='model.pth'):
    model = load_model(model_path)
    image_tensor = preprocess_image(image_path)

    with torch.no_grad():
        output = model(image_tensor)
        prediction = torch.argmax(output, dim=1).item()
        return "ASD" if prediction == 1 else "TD"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python predict_asd.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    result = predict(image_path)
    print(result)
