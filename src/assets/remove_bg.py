
from PIL import Image

def remove_background(input_path, output_path, tolerance=50):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()
        
        # Get the background color from the top-left corner
        bg_color = datas[0]
        
        newData = []
        for item in datas:
            # Check if the pixel is close to the background color
            if (abs(item[0] - bg_color[0]) < tolerance and
                abs(item[1] - bg_color[1]) < tolerance and
                abs(item[2] - bg_color[2]) < tolerance):
                newData.append((255, 255, 255, 0))  # Transparent
            else:
                newData.append(item)
        
        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully saved transparent logo to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    input_file = r"c:\Users\Pranavi Selvaraju\Desktop\asp\Aksecure-frontend\src\assets\logo.jpg"
    output_file = r"c:\Users\Pranavi Selvaraju\Desktop\asp\Aksecure-frontend\src\assets\logo-transparent.png"
    remove_background(input_file, output_file)
