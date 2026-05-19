export class Obstacle {
  constructor(x, width = 45, height = 50) {
    this.x = x;
    this.width = width;
    this.height = height;
    this.y = 460 - this.height;
  }

  update(gameSpeed, dt) {
    this.x -= gameSpeed * dt;
  }

  draw(ctx) {
    ctx.save();
    
    // Border color and layout details
    ctx.strokeStyle = '#3e2723'; // Dark brown border
    ctx.lineWidth = 3;
    
    const woodColor = '#8d6e63'; // Medium brown
    const highlightColor = '#a1887f'; // Light brown highlight
    
    const postWidth = this.width * 0.18;
    const postHeights = this.height;
    const post1X = this.x + this.width * 0.15;
    const post2X = this.x + this.width * 0.65;
    
    // Vertical Post 1
    ctx.fillStyle = woodColor;
    ctx.fillRect(post1X, this.y, postWidth, postHeights);
    ctx.strokeRect(post1X, this.y, postWidth, postHeights);
    
    // Highlight
    ctx.fillStyle = highlightColor;
    ctx.fillRect(post1X + 2, this.y + 2, postWidth - 4, 4);

    // Vertical Post 2
    ctx.fillStyle = woodColor;
    ctx.fillRect(post2X, this.y, postWidth, postHeights);
    ctx.strokeRect(post2X, this.y, postWidth, postHeights);

    // Highlight
    ctx.fillStyle = highlightColor;
    ctx.fillRect(post2X + 2, this.y + 2, postWidth - 4, 4);

    // Horizontal boards
    const boardHeight = this.height * 0.22;
    const board1Y = this.y + this.height * 0.2;
    const board2Y = this.y + this.height * 0.6;
    
    // Board 1
    ctx.fillStyle = woodColor;
    ctx.fillRect(this.x, board1Y, this.width, boardHeight);
    ctx.strokeRect(this.x, board1Y, this.width, boardHeight);
    
    // Highlight
    ctx.fillStyle = highlightColor;
    ctx.fillRect(this.x + 2, board1Y + 2, this.width - 4, 2);

    // Board 2
    ctx.fillStyle = woodColor;
    ctx.fillRect(this.x, board2Y, this.width, boardHeight);
    ctx.strokeRect(this.x, board2Y, this.width, boardHeight);

    // Highlight
    ctx.fillStyle = highlightColor;
    ctx.fillRect(this.x + 2, board2Y + 2, this.width - 4, 2);

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}
