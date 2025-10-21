let objs = [];
let colors = ['#f71735', '#f7d002', '#1A53C0', '#232323'];
let sel; // 新增：下拉選單變數
let overlayDiv; // 新增：置中覆蓋 iframe 容器
let overlayIframe; // 新增：iframe 參考
let closeBtn;   // 新增：關閉按鈕

function setup() {
    // 改為使用整個視窗大小
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
    objs.push(new DynamicShape());

    // 新增：建立選單
    sel = createSelect();
    sel.position(10, 10);
    // 放大字體與基本樣式
    sel.style('font-size', '24px');
    sel.style('padding', '6px 10px');
    sel.style('font-weight', '600');
    sel.style('font-family', 'Arial, sans-serif');
    sel.style('color', '#222');
    sel.style('background-color', 'rgba(255,255,255,0.9)');
    sel.style('border-radius', '6px');
    sel.option('作品一');
    sel.option('作品二');
    sel.option('作品三');
    sel.selected('作品一');
    sel.changed(onMenuChange);

    // 立即套用選單狀態（使初始為作品一時也會顯示 iframe）
    onMenuChange();
}

function draw() {
	background(255);
	for (let i of objs) {
		i.run();
	}

	if (frameCount % int(random([15, 30])) == 0) {
		let addNum = int(random(1, 30));
		for (let i = 0; i < addNum; i++) {
			objs.push(new DynamicShape());
		}
	}
	for (let i = 0; i < objs.length; i++) {
		if (objs[i].isDead) {
			objs.splice(i, 1);
		}
	}
}

function easeInOutExpo(x) {
	return x === 0 ? 0 :
		x === 1 ?
		1 :
		x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 :
		(2 - Math.pow(2, -20 * x + 10)) / 2;
}

class DynamicShape {
	constructor() {
		this.x = random(0.3, 0.7) * width;
		this.y = random(0.3, 0.7) * height;
		this.reductionRatio = 1;
		this.shapeType = int(random(4));
		this.animationType = 0;
		this.maxActionPoints = int(random(2, 5));
		this.actionPoints = this.maxActionPoints;
		this.elapsedT = 0;
		this.size = 0;
		this.sizeMax = width * random(0.01, 0.05);
		this.fromSize = 0;
		this.init();
		this.isDead = false;
		this.clr = random(colors);
		this.changeShape = true;
		this.ang = int(random(2)) * PI * 0.25;
		this.lineSW = 0;
	}

	show() {
		push();
		translate(this.x, this.y);
		if (this.animationType == 1) scale(1, this.reductionRatio);
		if (this.animationType == 2) scale(this.reductionRatio, 1);
		fill(this.clr);
		stroke(this.clr);
		strokeWeight(this.size * 0.05);
		if (this.shapeType == 0) {
			noStroke();
			circle(0, 0, this.size);
		} else if (this.shapeType == 1) {
			noFill();
			circle(0, 0, this.size);
		} else if (this.shapeType == 2) {
			noStroke();
			rect(0, 0, this.size, this.size);
		} else if (this.shapeType == 3) {
			noFill();
			rect(0, 0, this.size * 0.9, this.size * 0.9);
		} else if (this.shapeType == 4) {
			line(0, -this.size * 0.45, 0, this.size * 0.45);
			line(-this.size * 0.45, 0, this.size * 0.45, 0);
		}
		pop();
		strokeWeight(this.lineSW);
		stroke(this.clr);
		line(this.x, this.y, this.fromX, this.fromY);
	}

	move() {
		let n = easeInOutExpo(norm(this.elapsedT, 0, this.duration));
		if (0 < this.elapsedT && this.elapsedT < this.duration) {
			if (this.actionPoints == this.maxActionPoints) {
				this.size = lerp(0, this.sizeMax, n);
			} else if (this.actionPoints > 0) {
				if (this.animationType == 0) {
					this.size = lerp(this.fromSize, this.toSize, n);
				} else if (this.animationType == 1) {
					this.x = lerp(this.fromX, this.toX, n);
					this.lineSW = lerp(0, this.size / 5, sin(n * PI));
				} else if (this.animationType == 2) {
					this.y = lerp(this.fromY, this.toY, n);
					this.lineSW = lerp(0, this.size / 5, sin(n * PI));
				} else if (this.animationType == 3) {
					if (this.changeShape == true) {
						this.shapeType = int(random(5));
						this.changeShape = false;
					}
				}
				this.reductionRatio = lerp(1, 0.3, sin(n * PI));
			} else {
				this.size = lerp(this.fromSize, 0, n);
			}
		}

		this.elapsedT++;
		if (this.elapsedT > this.duration) {
			this.actionPoints--;
			this.init();
		}
		if (this.actionPoints < 0) {
			this.isDead = true;
		}
	}

	run() {
		this.show();
		this.move();
	}

	init() {
		this.elapsedT = 0;
		this.fromSize = this.size;
		this.toSize = this.sizeMax * random(0.5, 1.5);
		this.fromX = this.x;
		this.toX = this.fromX + (width / 10) * random([-1, 1]) * int(random(1, 4));
		this.fromY = this.y;
		this.toY = this.fromY + (height / 10) * random([-1, 1]) * int(random(1, 4));
		this.animationType = int(random(3));
		this.duration = random(20, 50);
	}
}

// 新增：顯示/隱藏覆蓋 iframe（可傳入 url 更新）
function showSiteOverlay(url) {
    if (!overlayDiv) {
        overlayDiv = createDiv('');
        overlayDiv.style('position', 'absolute');
        overlayDiv.style('left', '50%');
        overlayDiv.style('top', '50%');
        overlayDiv.style('transform', 'translate(-50%,-50%)');
        overlayDiv.style('width', '80vw');
        overlayDiv.style('height', '80vh');
        overlayDiv.style('z-index', '100000');
        overlayDiv.style('background-color', '#ffffff');
        overlayDiv.style('box-shadow', '0 8px 30px rgba(0,0,0,0.5)');
        overlayDiv.style('border-radius', '8px');
        overlayDiv.style('overflow', 'hidden');

        // 建立 iframe 並加入 overlayDiv
        overlayIframe = createElement('iframe');
        overlayIframe.attribute('src', url || 'about:blank');
        overlayIframe.style('width', '100%');
        overlayIframe.style('height', '100%');
        overlayIframe.style('border', '0');
        overlayIframe.style('border-radius', '8px');
        overlayIframe.parent(overlayDiv);

        // 建立關閉按鈕
        closeBtn = createButton('關閉');
        closeBtn.parent(overlayDiv);
        closeBtn.style('position', 'absolute');
        closeBtn.style('right', '8px');
        closeBtn.style('top', '8px');
        closeBtn.style('z-index', '100001');
        closeBtn.style('padding', '6px 10px');
        closeBtn.style('font-size', '14px');
        closeBtn.mousePressed(hideSiteOverlay);
    } else {
        // 已存在時只更新 iframe 的 src
        if (overlayIframe) overlayIframe.attribute('src', url || 'about:blank');
    }
    overlayDiv.show();
}

function hideSiteOverlay() {
    if (overlayDiv) {
        // 停止 iframe 內容（避免背景音效持續）
        if (overlayIframe) overlayIframe.attribute('src', 'about:blank');
        overlayDiv.hide();
    }
}

// 新增：選單變更處理（顯示不同網址或隱藏）
function onMenuChange() {
    const v = sel.value();
    if (v === '作品一') {
        colors = ['#f71735', '#f7d002', '#1A53C0', '#232323'];
        background(255);
        showSiteOverlay('https://lue950503-spec.github.io/20251014/');
    } else if (v === '作品二') {
        colors = ['#0f4c5c', '#7fb069', '#f2d388', '#f4845f'];
        background(30);
        showSiteOverlay('https://lue950503-spec.github.io/20251014-2-/');
    } else if (v === '作品三') {
        colors = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff'];
        background(20);
        // 顯示作品三的 HackMD 網址
        showSiteOverlay('https://hackmd.io/@s4I8mCLfQjaFdMf2wg3qTw/BJ8Rjuyngg');
    }
    // 重置物件以立即看到變化
    objs = [];
    objs.push(new DynamicShape());
}

// 新增：視窗大小改變時調整畫布
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // overlay 使用 css transform置中，無需額外處理
}