import os
import re


def rename_files(start_folder):
    # 确保文件夹路径存在
    if not os.path.exists(start_folder):
        print(f"指定的文件夹 {start_folder} 不存在。")
        return

    # 收集所有文件及其原始数字
    file_list = []
    for filename in os.listdir(start_folder):
        file_path = os.path.join(start_folder, filename)
        # 检查文件是否是普通文件（不是目录）
        if os.path.isfile(file_path):
            # 提取文件名中的数字部分
            match = re.search(r'\d+', filename)
            if match:
                # 获取数字部分并转换为整数
                number = int(match.group())
                file_list.append((filename, number))
            else:
                # 如果没有找到数字，使用默认编号
                print(f"警告: {filename} 中没有找到数字，将使用默认编号。")
                file_list.append((filename, float('inf')))  # 放在最后

    # 按提取的数字排序
    file_list.sort(key=lambda x: x[1])

    # 重命名文件
    for i, (old_filename, number) in enumerate(file_list, 1):
        # 如果没有找到数字，使用递增的计数器
        if number == float('inf'):
            new_name = f"sign_{i}.jpg"
        else:
            new_name = f"sign_{number}.jpg"

        old_path = os.path.join(start_folder, old_filename)
        new_path = os.path.join(start_folder, new_name)

        # 重命名文件
        os.rename(old_path, new_path)
        print(f"将 {old_filename} 重命名为 {new_name}")


# 指定要修改文件名的文件夹路径
folder_path = r"C:\Users\Administrator\Desktop\扫描件_叠南青院寺"
rename_files(folder_path)