const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
  @property(cc.Node)
  machine = null;

  @property({ type: cc.AudioClip })
  audioClick = null;

  private block = false;

  private result = null;

  // Array used to calculate the probability of each possible type of result
  private possibleResults = [];

  // Variable that stores the information of which lines are winners
  private jackpot;

  start(): void {
    this.machine.getComponent('Machine').createMachine();
    this.setPossibleResults();
  }

  update(): void {
    if (this.block && this.result != null) {
      this.informStop();
      this.result = null;
    }
  }

  click(): void {
    cc.audioEngine.playEffect(this.audioClick, false);

    if (this.machine.getComponent('Machine').spinning === false) {
      this.block = false;
      this.machine.getComponent('Machine').spin();
      this.requestResult();
    } else if (!this.block) {
      this.block = true;
      this.machine.getComponent('Machine').lock();
    }
  }

  async requestResult(): Promise<void> {
    this.result = null;
    this.result = await this.getAnswer();
  }


  getAnswer(): Promise<Array<Array<number>>> {
    //const slotResult = [];
    const slotResult = this.getResult();    
    return new Promise<Array<Array<number>>>(resolve => {
      setTimeout(() => {
        resolve(slotResult);
      }, 1000 + 500 * Math.random());
    });
  }

  informStop(): void {
    const resultRelayed = this.result;
    this.machine.getComponent('Machine').stop(resultRelayed, this.jackpot);
  }

  // Choose a result for the draw based on the likelihood of possible results
  getResult(): number[][] {
    var newResult = [];
    var resultType = this.getResutType();
    
    this.jackpot = [-1, -1, -1];
    var iLineJackpot = Math.floor(Math.random() * 3);

    // Choose which lines will have the same Tile and choose which Tile it will be
    if (resultType == ResultType.OneLine) 
    {
      this.jackpot[iLineJackpot] = Math.floor(Math.random() * 30);
    }
    else if (resultType == ResultType.TwoLines) 
    {
      for (let i = 0; i < 3; i++) {
        if (i != iLineJackpot){
          this.jackpot[i] = Math.floor(Math.random() * 30);
        }
      }
    }
    else if (resultType == ResultType.ThreeLines) 
    {
      for (let i = 0; i < 3; i++) {
        this.jackpot[i] = Math.floor(Math.random() * 30);
      }
    }
    
    // Calculate the results of all Tiles
    for (let i = 0; i < this.machine.getComponent('Machine').numberOfReels; i++) {
      newResult.push([])
      for (let j = 0; j < 3; j++) {
        newResult[i].push([])
        if (this.jackpot[j] != -1) { // Is a Winning line?
          newResult[i][j] = this.jackpot[j];
        }
        else { // Random Tile
          newResult[i][j] = Math.floor(Math.random() * 30);
        }
      }
    }

    return newResult;
  }

  // Populate an array of possible Results
  setPossibleResults(): void {
    this.possibleResults = [];
    for (var i = 0; i < 50; i++) this.possibleResults.push(ResultType.Random);
    for (var i = 0; i < 33; i++) this.possibleResults.push(ResultType.OneLine);
    for (var i = 0; i < 10; i++) this.possibleResults.push(ResultType.TwoLines);
    for (var i = 0; i < 7; i++) this.possibleResults.push(ResultType.ThreeLines);
  }

  // Randomly select a type o result
  getResutType() : ResultType {
    //return ResultType.ThreeLines;
    if (this.possibleResults.length == 0) this.setPossibleResults();    
    const randomIndex = Math.floor(Math.random() * this.possibleResults.length);
    return this.possibleResults.splice(randomIndex,1)[0];
  }
}

// What types of results are possible
enum ResultType {
  Random,
  OneLine,
  TwoLines,
  ThreeLines
}