#!/usr/bin/env python3
"""
Python скрипт для удаления фона с изображений с помощью rembg
Используется микросервисом Image Processing Service
"""

import sys
import os
from rembg import remove
from PIL import Image

def remove_background(input_path, output_path):
    """
    Удаляет фон с изображения и сохраняет результат

    Args:
        input_path (str): Путь к исходному изображению
        output_path (str): Путь для сохранения обработанного изображения

    Returns:
        str: Путь к обработанному изображению
    """
    try:
        # Открываем изображение
        input_image = Image.open(input_path)

        # Удаляем фон
        output_image = remove(input_image)

        # Создаем директорию если не существует
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Сохраняем результат
        output_image.save(output_path, 'PNG')

        return output_path

    except Exception as e:
        print(f"Error processing image: {str(e)}", file=sys.stderr)
        sys.exit(1)

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 rembg_process.py <input_path> <output_path>", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    if not os.path.exists(input_path):
        print(f"Input file does not exist: {input_path}", file=sys.stderr)
        sys.exit(1)

    try:
        result_path = remove_background(input_path, output_path)
        print(result_path)
    except Exception as e:
        print(f"Failed to process image: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
