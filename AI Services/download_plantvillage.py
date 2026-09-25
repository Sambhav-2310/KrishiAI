from datasets import load_dataset

print("Downloading PlantVillage dataset...")
print("This may take some time on the first run.")

dataset = load_dataset(
    "mohanty/PlantVillage",
    "default"
)

print("\nDataset downloaded successfully!")
print(dataset)

for split in dataset:
    print(f"{split}: {len(dataset[split])} images")

print("\nDataset features:")
print(dataset["train"].features)