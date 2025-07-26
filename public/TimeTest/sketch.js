// sketch.js
let codeFont;
let particles = [];
let digitPoints = [];
let forming = false;
let input, button;
let fontSize = 2400; // 放大3倍的数字大小
let fontLoaded = false;

// 预加载字体
function preload() {
  // 加载GoodfonT-NET-XS03字体
  codeFont = loadFont('GoodfonT-NET-XS03.ttf', 
    () => {
      console.log('字体加载成功！');
      fontLoaded = true;
    },
    () => {
      console.log('字体加载失败，将使用备用字体');
      fontLoaded = false;
    }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(239, 248, 255); // #EFF8FF
  
  // 创建输入控件
  input = createInput('');
  input.position(20, 20);
  input.size(150);
  input.style('font-size', '16px');
  input.style('padding', '5px');
  input.style('font-family', 'Courier New');
  
  button = createButton('形成数字');
  button.position(input.x + input.width + 10, 20);
  button.mousePressed(() => formNumber(input.value()));
  button.style('font-size', '16px');
  button.style('padding', '5px 10px');
  button.style('font-family', 'Courier New');
  
  // 创建满屏的代码字符粒子
  initializeParticles();
}

// 初始化粒子系统
function initializeParticles() {
  particles = [];
  
  // 创建更密集的粒子网格以确保有足够的粒子填充大数字
  let spacing = 25; // 减小间距以增加粒子密度
  let cols = ceil(width / spacing);
  let rows = ceil(height / spacing);
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * spacing + random(-5, 5);
      let y = j * spacing + random(-5, 5) + 60;
      
      // 确保粒子在屏幕范围内
      x = constrain(x, 10, width - 10);
      y = constrain(y, 70, height - 10);
      
      particles.push(new CodeParticle(x, y));
    }
  }
  
  console.log('创建了 ' + particles.length + ' 个粒子');
}

function draw() {
  background(239, 248, 255); // #EFF8FF - 保持背景颜色
  
  // 显示调试信息
  push();
  fill(55, 71, 89, 51); // #374759 with 20% opacity (51/255 = 0.2)
  textSize(12);
  noStroke();
  text('粒子数: ' + particles.length, 20, height - 40);
  text('字体状态: ' + (fontLoaded ? '已加载' : '未加载'), 20, height - 20);
  if (forming && digitPoints.length > 0) {
    text('数字形状点数: ' + digitPoints.length, 20, height - 60);
  }
  pop();
  
  // 更新和显示所有粒子
  for (let p of particles) {
    p.update();
    p.display();
  }
}

// 生成实心数字的点阵
function generateSolidDigitPoints(val) {
  let points = [];
  
  // 根据数字长度调整字体大小
  let adjustedFontSize = fontSize;
  if (val.length === 2) {
    adjustedFontSize = fontSize * 0.5;
  } else if (val.length === 3) {
    adjustedFontSize = fontSize * 0.35;
  }
  
  // 创建离屏图形缓冲区
  let pg = createGraphics(width, height);
  pg.background(239, 248, 255); // 白色背景
  
  if (fontLoaded && codeFont) {
    pg.textFont(codeFont);
  } else {
    pg.textFont('Arial Black'); // 使用粗体字体作为备选
  }
  
  pg.fill(55, 71, 89); // #374759
  pg.textAlign(CENTER, CENTER);
  pg.textSize(adjustedFontSize);
  pg.textStyle(BOLD);
  
  // 在画布中心绘制数字
  pg.text(val, width/2, height/2);
  
  // 扫描像素以找到黑色区域（数字形状）
  pg.loadPixels();
  let d = pg.pixelDensity();
  let step = 8; // 采样步长，值越小点越密集
  
  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      // 获取像素颜色
      let index = 4 * (d * y * width * d + d * x);
      let r = pg.pixels[index];
      
      // 如果像素是黑色或接近黑色（数字部分）
      if (r < 128) {
        points.push({
          x: x + random(-2, 2),
          y: y + random(-2, 2)
        });
      }
    }
  }
  
  pg.remove(); // 清理临时画布
  return points;
}

// 形成数字的主函数
function formNumber(val) {
  // 验证输入
  if (!val || val.length === 0 || isNaN(val)) {
    console.log('请输入有效的数字');
    return;
  }
  
  console.log('开始形成数字: ' + val);
  
  // 生成实心数字的点阵
  digitPoints = generateSolidDigitPoints(val);
  
  console.log('生成了 ' + digitPoints.length + ' 个目标点');
  
  if (digitPoints.length > 0) {
    forming = true;
    assignTargetsEvenly();
  }
}

// 均匀分配粒子到目标点
function assignTargetsEvenly() {
  // 确保有足够的粒子
  let neededParticles = Math.max(digitPoints.length, particles.length);
  
  // 如果粒子不够，创建更多
  while (particles.length < neededParticles) {
    particles.push(new CodeParticle(random(width), random(height)));
  }
  
  // 重置所有粒子状态
  particles.forEach(p => {
    p.isInShape = false;
    p.hasTarget = false;
  });
  
  // 方法1：如果粒子数量大于等于目标点数量
  if (particles.length >= digitPoints.length) {
    // 打乱粒子数组以确保随机分配
    let shuffledParticles = shuffle(particles.slice());
    
    // 将前N个粒子分配到数字形状
    for (let i = 0; i < digitPoints.length; i++) {
      shuffledParticles[i].setTargetPoint(
        digitPoints[i].x,
        digitPoints[i].y,
        true
      );
    }
    
    // 剩余的粒子均匀分散在屏幕上
    let remainingCount = shuffledParticles.length - digitPoints.length;
    let cols = Math.ceil(Math.sqrt(remainingCount));
    let rows = Math.ceil(remainingCount / cols);
    let index = digitPoints.length;
    
    for (let i = 0; i < cols && index < shuffledParticles.length; i++) {
      for (let j = 0; j < rows && index < shuffledParticles.length; j++) {
        let x = map(i, 0, cols-1, 50, width-50);
        let y = map(j, 0, rows-1, 100, height-50);
        shuffledParticles[index].setTargetPoint(
          x + random(-20, 20),
          y + random(-20, 20),
          false
        );
        index++;
      }
    }
  } else {
    // 方法2：如果目标点多于粒子（不太可能发生）
    let particlesPerPoint = Math.floor(particles.length / digitPoints.length);
    let extraParticles = particles.length % digitPoints.length;
    let particleIndex = 0;
    
    for (let i = 0; i < digitPoints.length; i++) {
      let count = particlesPerPoint + (i < extraParticles ? 1 : 0);
      for (let j = 0; j < count && particleIndex < particles.length; j++) {
        particles[particleIndex].setTargetPoint(
          digitPoints[i].x + random(-3, 3),
          digitPoints[i].y + random(-3, 3),
          true
        );
        particleIndex++;
      }
    }
  }
}

// 代码粒子类
class CodeParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.originalPos = this.pos.copy();
    this.vel = createVector(0, 0);
    this.target = this.pos.copy();
    
    // 扩展的字符集 - 避免使用引号和反斜杠以防止解析错误
    this.chars = ['0','1','2','3','4','5','6','7','8','9',
                  '+','-','*','/','=','>','<','!','?','.',
                  '@','#','$','%','&','(',')','{','}','[',']',
                  ';',':',',','|','_','~',
                  'a','b','c','d','e','f','x','y','z','i','j','k'];
    this.char = random(this.chars);
    
    // 放大初始字符
    this.baseSize = 30;
    this.size = this.baseSize;
    
    // 闪烁参数
    this.flickerSpeed = random(0.03, 0.1);
    this.flickerOffset = random(TWO_PI);
    this.opacity = 0.1; // 初始透明度设为10%
    this.isInShape = false;
    this.hasTarget = false;
    this.lastCharChange = millis();
    
    // 颜色相关属性
    this.currentColor = { r: 55, g: 71, b: 89 }; // #374759
    this.targetColor = { r: 248, g: 103, b: 41 }; // #F86729
    this.colorTransition = 0; // 0 表示原色，1 表示目标色
  }
  
  setTargetPoint(x, y, inShape) {
    this.target.x = x;
    this.target.y = y;
    this.isInShape = inShape;
    this.hasTarget = true;
  }
  
  update() {
    // 平滑移动到目标位置
    if (forming && this.hasTarget) {
      let d = p5.Vector.dist(this.pos, this.target);
      let speed = map(d, 0, 500, 0.02, 0.15);
      this.pos.x = lerp(this.pos.x, this.target.x, speed);
      this.pos.y = lerp(this.pos.y, this.target.y, speed);
    }
    
    // 字符闪烁效果
    let currentTime = millis();
    let flickerInterval = 1000 / (this.flickerSpeed * 50);
    
    if (!forming || !this.isInShape) {
      // 不在数字形状内的粒子持续闪烁
      if (currentTime - this.lastCharChange > flickerInterval) {
        this.char = random(this.chars);
        this.lastCharChange = currentTime;
      }
      
      // 透明度在0-20%之间波动
      let flicker = sin(frameCount * this.flickerSpeed + this.flickerOffset);
      this.opacity = map(flicker, -1, 1, 0, 0.2); // 0-20%透明度
      
      // 大小呼吸效果
      this.size = this.baseSize + sin(frameCount * 0.05 + this.flickerOffset) * 2;
      
      // 颜色渐变回原色
      this.colorTransition = lerp(this.colorTransition, 0, 0.05);
    } else {
      // 在数字形状内的粒子
      // 透明度保持在15-20%之间，更加稳定
      let flicker = sin(frameCount * 0.02 + this.flickerOffset);
      this.opacity = map(flicker, -1, 1, 0.15, 0.2);
      this.size = lerp(this.size, this.baseSize * 0.85, 0.1);
      
      // 降低闪烁频率
      if (random(1) < 0.003) {
        this.char = random(this.chars);
      }
      
      // 颜色渐变到橙色
      this.colorTransition = lerp(this.colorTransition, 1, 0.08);
    }
    
    // 根据过渡值计算当前颜色
    this.currentColor.r = lerp(55, 248, this.colorTransition);
    this.currentColor.g = lerp(71, 103, this.colorTransition);
    this.currentColor.b = lerp(89, 41, this.colorTransition);
  }
  
  display() {
    push();
    
    // 设置字体
    if (fontLoaded && codeFont) {
      textFont(codeFont);
    } else {
      textFont('Courier New');
    }
    
    // 使用动态颜色，透明度由this.opacity控制（0-20%）
    fill(this.currentColor.r, this.currentColor.g, this.currentColor.b, this.opacity * 255);
    noStroke();
    textSize(this.size);
    textAlign(CENTER, CENTER);
    text(this.char, this.pos.x, this.pos.y);
    pop();
  }
}

// 窗口大小改变时重新初始化
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeParticles();
  
  // 如果正在显示数字，重新计算
  if (forming && input.value()) {
    formNumber(input.value());
  }
}

// 辅助函数：打乱数组
function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}