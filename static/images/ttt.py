from PIL import Image
import shutil


def convert_gif_to_jpg(gif_path, output_folder):
    try:
        # 打开 GIF 图像
        gif = Image.open(gif_path)
        # 转换为 JPG 格式
        jpg_image = gif.convert('RGB')
        # 保存为 JPG 文件
        jpg_path = f"{output_folder}/sign_1.jpg"
        jpg_image.save(jpg_path)

        # 复制 100 份
        for i in range(2, 101):
            new_path = f"{output_folder}/sign_{i}.jpg"
            shutil.copyfile(jpg_path, new_path)
        print("转换和复制操作完成。")
    except Exception as e:
        print(f"发生错误: {e}")


if __name__ == "__main__":
    # 替换为你的 GIF 文件路径
    gif_file_path = r"/static\images\90bc10c3cd129b700ccf7da82ff9e706.gif"
    # 替换为你想要保存 JPG 文件的文件夹路径
    output_folder_path = r"/static\images"
    convert_gif_to_jpg(gif_file_path, output_folder_path)
