import logo from './logo.svg';
import './App.css';
import React from 'react';

function App() {
  return <Grid width={10} hieght={10} mine_count={10} />
}

function Square(props) {
  return <button class="square" onClick={props.onClick}>{props.value}</button>
}

class Grid extends React.Component {
  Flag = "🚩";
  Bomb = "💣";

  constructor(props) {
    super(props);
    this.state = {
      width: props.width,
      hieght: props.hieght,
      mine_count: props.mine_count,
    }
    this.state = this.createState();
  }

  createState() {
    return {
      sqrs: Array(this.state.hieght).fill(null)
        .map(_ => { return Array(this.state.width).fill(null) }),
      mines: [],
      started: false,
      flaging: false,
      width: this.state.width,
      hieght: this.state.hieght,
      mine_count: this.state.mine_count,
    }
  }

  render() {
    return <div>
      <h1>{this.header()}</h1>
      {this.state.sqrs.map(
        (col, y) =>
          <div className="board-row">
            {col.map((val, x) =>
              <Square
                value={val}
                onClick={() => this.squareOnClick([x, y])}
              />)}
          </div>
      )}
      <button onClick={() => this.setState({ flaging: !this.state.flaging })}>
        {`turn flaging ${this.state.flaging ? "off" : "on"}`}
      </button>
      <button onClick={() => this.setState(this.createState())}>start new game</button>
      <br></br>
      {this.numberInput("width")}
      {this.numberInput("hieght")}
      {this.numberInput("mine_count")}
    </div>
  }

  squareOnClick(pos) {
    if(!(this.lost() || this.won())){
      const mines = this.state.started ? this.state.mines : this.placeMines(pos);
      const sqrs = this.state.sqrs.slice();;
      this.setState({
        sqrs: this.uncoverSquares(pos, sqrs, mines)
        , mines: mines
        , started: true
      })
    }
  }

  uncoverSquares(pos, sqrs, mines){
    const uncoveredVal = this.squareVal(pos, mines);
    sqrs[pos[1]][pos[0]] = uncoveredVal;
    if(uncoveredVal === 0)
      this.adjacentPositions(pos)
        .filter(p => !this.isUncovered(p))
        .forEach(p => this.uncoverSquares(p, sqrs, mines)) 
    return sqrs;

  }
  
  header() {
    if(this.lost())
      return "You Lost";
    else if(this.state.started){
      const remaining = this.spacesLeft()
      return remaining === 0 ? "You Won!" : `Spaces left: ${remaining}`
    }else 
      return "New Game Started";
  }

  won(){
    return this.spacesLeft() === 0;
  }

  spacesLeft(){
    return this
      .state
      .sqrs
      .flat()
      .filter(val => val === this.Flag || val === null)
      .length
      - this.state.mines.length;
  }

  numberInput(value) {
    return <div>
      <label>{value}</label>
      <input
        min="1"
        type="number"
        value={this.state[value]}
        onInput={input => {
          let tmp = {};
          tmp[value] = Number(input.target.value);
          this.setState(tmp);
        }}>
      </input>
    </div>
  }

  lost(){
    return this.state.sqrs.flat().some(v=> v==this.Bomb);
  }

  randInt(n) {
    return Math.floor(Math.random() * n);
  }


  placeMines(pos) {
    const mines = [];
    while (mines.length < this.state.mine_count) {
      const mine = [
        this.randInt(this.state.width),
        this.randInt(this.state.hieght)
      ]
      if (!this.isMine(mine, mines.concat([pos])))
        mines.push(mine)
    }
    return mines;
  }

  squareVal(pos, mines) {
    if (this.state.flaging) {
      const val = this.valAt(pos);
      switch (val) {
        case null: return this.Flag;
        case this.Flag: return null;
        default: return val;
      }
    } else if (this.isUncovered(pos) || this.isFlag(pos))
      return this.valAt(pos);
    else if (this.isMine(pos, mines))
      return this.Bomb;
    else
      return this.adjacentMines(pos, mines);
  }

  adjacentMines(pos, mines) {
    return this.adjacentPositions(pos)
      .filter(p => this.isMine(p, mines))
      .length
  }

  adjacentPositions(pos){
    const diffs = [-1, 0, 1];
    return diffs
      .flatMap(x =>
        diffs.map(y => [pos[0] + x, pos[1] + y])
      ).filter(([x, y]) => x >= 0 && x < this.state.sqrs[0].length && y >= 0 && y < this.state.sqrs.length)
  }

  isUncovered(pos) {
    return this.valAt(pos) !== null && this.valAt(pos) !== this.Flag
  }

  isFlag(pos) {
    return this.valAt(pos) === this.Flag
  }

  isMine(pos, mines) {
    return mines.some(tup => this.posAreEqual(tup, pos));
  }

  valAt(pos) {
    return this.state.sqrs[pos[1]][pos[0]];
  }

  posAreEqual(pos1, pos2) {
    return (pos1[0] === pos2[0]) && (pos1[1] === pos2[1]);
  }
}

export default App;
