import os
import json
from flask import Flask, render_template, request, jsonify, url_for, flash, redirect, session, send_from_directory
from datetime import datetime, timedelta
import string
import random
from waitress import serve

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # 生产环境需更换为安全密钥

# 定义 JSON 数据目录路径
JSON_DIR = os.path.join(app.static_folder, 'data')

# 确保目录存在
os.makedirs(JSON_DIR, exist_ok=True)

# 内存存储验证码（键: 验证码, 值: 过期时间）
captcha_store = {}

# 硬编码管理员账号（生产环境需改为安全方式）
ADMIN_USER = "admin"
ADMIN_PWD = "admin123"

def is_admin_logged_in():
    """检查管理员是否已登录"""
    return session.get('admin_logged_in', False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if is_admin_logged_in():
        return redirect(url_for('admin_dashboard'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == ADMIN_USER and password == ADMIN_PWD:
            session['admin_logged_in'] = True  # 记录登录状态
            return redirect(url_for('admin_dashboard'))
        flash('用户名或密码错误')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('login'))

@app.route('/admin/dashboard')
def admin_dashboard():
    if not is_admin_logged_in():
        return redirect(url_for('login'))
    return render_template('admin_dashboard.html')

@app.route('/admin/manage_captcha')
def manage_captcha():
    if not is_admin_logged_in():
        return redirect(url_for('login'))

    # 获取当前未过期的验证码（过滤已过期的）
    current_time = datetime.now()
    active_captchas = []
    for code, expires in captcha_store.items():
        if expires > current_time:
            active_captchas.append({
                'code': code,
                'generated_at': expires - timedelta(minutes=int((expires - datetime.now()).total_seconds() // 60)),
                # 生成时间
                'expires_at': expires
            })

    # 按过期时间排序（最近过期的在前）
    active_captchas.sort(key=lambda x: x['expires_at'])
    return render_template('manage_captcha.html', captchas=active_captchas)

@app.route('/generate_captcha', methods=['POST'])
def generate_captcha():
    if not is_admin_logged_in():
        return redirect(url_for('login'))

    valid_minutes = request.form.get('valid_time')
    if valid_minutes not in ['1', '3', '5']:
        flash('请选择有效时间（1/3/5分钟）')
        return redirect(url_for('admin_dashboard'))

    # 生成6位验证码（字母+数字）
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    expires_at = datetime.now() + timedelta(minutes=int(valid_minutes))
    captcha_store[code] = expires_at  # 存储到内存

    return render_template('captcha_generated.html',
                           captcha=code,
                           expires=expires_at.strftime("%Y-%m-%d %H:%M:%S"))

@app.route('/admin/delete_captcha/<captcha_code>')
def delete_captcha(captcha_code):
    if not is_admin_logged_in():
        return redirect(url_for('login'))

    if captcha_code in captcha_store:
        del captcha_store[captcha_code]
        flash('验证码已删除')
    else:
        flash('验证码不存在或已过期')
    return redirect(url_for('manage_captcha'))

@app.route('/verify_captcha', methods=['POST'])
def verify_captcha():
    user_code = request.json.get('captcha', '').upper().strip()
    current_time = datetime.now()

    # 检查验证码是否存在且未过期
    if user_code in captcha_store and captcha_store[user_code] > current_time:
        del captcha_store[user_code]  # 验证后删除，防止重复使用
        return jsonify({'valid': True})
    return jsonify({'valid': False})

@app.route('/get_sign_info', methods=['POST'])
def get_sign_info():
    sign_number = request.json.get('sign_number')
    if sign_number is not None:
        sign_image = url_for('static', filename=f'images/sign_{sign_number}.jpg')
        return jsonify({
            'sign_image': sign_image,
        })
    return jsonify({'error': '缺少签号信息'}), 400

@app.route('/get_all_json_data', methods=['GET'])
def get_all_json_data():
    all_data = []
    try:
        for filename in os.listdir(JSON_DIR):
            if filename.endswith('.json'):
                file_path = os.path.join(JSON_DIR, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        all_data.append(data)
                except Exception as e:
                    print(f"Error reading {filename}: {e}")
    except FileNotFoundError:
        pass  # 目录不存在时返回空列表
    return jsonify(all_data)

@app.route('/upload_json_data', methods=['POST'])
def upload_json_data():
    if not is_admin_logged_in():
        return jsonify({'error': '请先登录'}), 401

    try:
        json_data = request.get_json()
        if json_data is None:
            return jsonify({'error': '未提供有效的 JSON 数据'}), 400

        # 生成一个唯一的文件名
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}.json"
        file_path = os.path.join(JSON_DIR, filename)

        # 将 JSON 数据写入文件
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=4)

        return jsonify({'message': 'JSON 数据上传成功', 'filename': filename}), 200

    except Exception as e:
        return jsonify({'error': f'上传失败: {str(e)}'}), 500

# 如果需要提供 JSON 文件的直接下载链接，可以添加以下路由
@app.route('/download_json/<path:filename>')
def download_json(filename):
    return send_from_directory(JSON_DIR, filename)

if __name__ == '__main__':
    # 添加0.0.0.0监听地址，允许外部访问
    serve(app, host='0.0.0.0', port=5000)

    # app.run(host='0.0.0.0', port=5000, debug=True)