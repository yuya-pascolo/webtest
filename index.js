(function() {

    /**
     * ■説明
     * あらかじめルートが決められたあみだくじを作成します。
     * x,y座標は最初に縦線と横線が交差する点が(0,0)です。
     * 各あみだくじアニメーション実行中は他の選択肢を選べません。（連打対策）
     * アニメーション時の円及び線の色はそれぞれ設定可能です。
     */

    let amidaBody = document.querySelector('#amida-body');
    let amidaHeader = document.querySelector('#amida-header');

    //設定項目
    let amidaLineColor = '#ccc';
    let svgElement = null;
    let strokeWidth = 4;
    let moveLineWidth = strokeWidth + 2;
    let circleWidth = 17;
    let moveSpeed = 3;

    //編集不可
    let splitLineXArray = [];
    let splitLineYArray = [];
    let amidaExecuting = false;
    let preOffsetX = 0;
    let strokeWidthOffset = strokeWidth / 2;
    let horizontalLine = [];
    horizontalLine.push({xStart:0,xEnd:1,y:0});
    horizontalLine.push({xStart:2,xEnd:3,y:0});
    horizontalLine.push({xStart:0,xEnd:1,y:1});
    horizontalLine.push({xStart:1,xEnd:2,y:2});
    horizontalLine.push({xStart:0,xEnd:1,y:3});
    horizontalLine.push({xStart:2,xEnd:3,y:3});

    let amidaheaderItem1 = document.querySelector('#amida-header-item1');
    let amidaheaderItem2 = document.querySelector('#amida-header-item2');
    let amidaheaderItem3 = document.querySelector('#amida-header-item3');
    let amidaheaderItem4 = document.querySelector('#amida-header-item4');

    amidaheaderItem1.addEventListener("click", async function() {
        let itemColor = '#00c853';
        let lineColor = '#ffe54c';
        let firstX = 0;
        let pathData = [];
        pathData.push({x:1,y:0});
        pathData.push({x:1,y:1});
        pathData.push({x:0,y:1});
        pathData.push({x:0,y:3});
        pathData.push({x:1,y:3});
        await executeAmida(itemColor,lineColor,firstX,pathData);
    });

    amidaheaderItem2.addEventListener("click", async function() {
        let itemColor = '#007ac1';
        let lineColor = '#ffc4ff';
        let firstX = 1;
        let pathData = [];
        pathData.push({x:0,y:0});
        pathData.push({x:0,y:1});
        pathData.push({x:1,y:1});
        pathData.push({x:1,y:2});
        pathData.push({x:2,y:2});
        pathData.push({x:2,y:3});
        pathData.push({x:3,y:3});
        await executeAmida(itemColor,lineColor,firstX,pathData);
    });

    amidaheaderItem3.addEventListener("click", async function() {
        let itemColor = '#ff8a80';
        let lineColor = '#ffd0b0';
        let firstX = 2;
        let pathData = [];
        pathData.push({x:3,y:0});
        pathData.push({x:3,y:3});
        pathData.push({x:2,y:3});
        await executeAmida(itemColor,lineColor,firstX,pathData);
    });

    amidaheaderItem4.addEventListener("click", async function() {
        let itemColor = '#00e5ff';
        let lineColor = '#c8e6c9';
        let firstX = 3;
        let pathData = [];
        pathData.push({x:2,y:0});
        pathData.push({x:2,y:2});
        pathData.push({x:1,y:2});
        pathData.push({x:1,y:3});
        pathData.push({x:0,y:3});
        await executeAmida(itemColor,lineColor,firstX,pathData);
    });

    function CreateMovePathData(horizontalLineData,firstX){
        let movePathData = [];
        let nowY = 0;
        let nowX = firstX;
        let needOnemore = false;
        let alreadyAddedHorizontalData = [];
        function checkAlreadyAdded(data){
            for(const alreadyData of alreadyAddedHorizontalData){
                if(data.xStart == alreadyData.xStart && data.xEnd == alreadyData.xEnd && data.y == alreadyData.y)
                return true;
            }
            return false;
        }
        while(nowY < splitLineYArray.length) {
            needOnemore = false;
            movePathData.push({x:nowX,y:nowY});
            for(const data of horizontalLineData){
                if(!checkAlreadyAdded(data)) {
                    if(nowY == data.y){
                        if(nowX == data.xStart){
                            alreadyAddedHorizontalData.push(data);
                            nowX = data.xEnd;
                            movePathData.push({x:nowX,y:nowY});
                            needOnemore = true;    
                        }
                        else if(nowX == data.xEnd){
                            alreadyAddedHorizontalData.push(data);
                            nowX = data.xStart;
                            movePathData.push({x:nowX,y:nowY});
                            needOnemore = true;    
                        }
                    }    
                }
            }
            if(!needOnemore){
                nowY++;
            }
        }
        return movePathData;
    }

    function createAmida(horizontalLineData){
        amidaExecuting = false;
        while( amidaBody.firstChild ){
            amidaBody.removeChild( amidaBody.firstChild );
        }
        amidaBody.style.width = amidaHeader.clientWidth + 'px';
        amidaBody.style.height = amidaHeader.clientWidth + 'px';     

        svgElement = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svgElement.setAttribute('width',amidaBody.clientWidth);
        svgElement.setAttribute('height',amidaBody.clientHeight);
        svgElement.setAttribute('viewBox','0 0 ' + amidaBody.clientWidth + ' ' + amidaBody.clientHeight);
        createAndAdVerticalLines(svgElement,amidaBody.clientWidth,amidaBody.clientHeight,4);
        amidaBody.appendChild(svgElement);

        for(const data of horizontalLineData){
            createHorizontalLine(svgElement,data.xStart,data.xEnd,data.y);            
        }
    }

    async function executeAmida(itemColor,lineColor,firstX, pathData){

        if(amidaExecuting)
            return;
        else
            amidaExecuting = true;

        let line = createLineForMove(lineColor, moveLineWidth);
        let circle = createCircle(svgElement,itemColor,splitLineXArray[firstX],0);
        await sleep(200);
        let linePathData = [];
        preOffsetX = strokeWidth / 2 * -1;
        linePathData.push({x:splitLineXArray[firstX] - strokeWidth / 2,y:0});
        linePathData.push({x:0,y:circleWidth - moveLineWidth / 2});
        let lastX = 0;
        let firstMove = true;

        for(const data of pathData){
            if(firstMove){
                await moveTo(circle,line,linePathData,moveLineWidth,splitLineXArray[firstX],splitLineYArray[0],firstMove);
            }
            firstMove = false;
            await moveTo(circle,line,linePathData,moveLineWidth,splitLineXArray[data.x],splitLineYArray[data.y],firstMove);
            lastX = data.x;
        }

        await moveTo(circle,line,linePathData,moveLineWidth,splitLineXArray[lastX],amidaBody.clientHeight - circleWidth,false);
        linePathData.push({x:0,y:circleWidth + moveLineWidth / 2});
        moveLine(line,linePathData, moveLineWidth);
        await sleep(1000);
        if(svgElement.contains(circle)){
            svgElement.removeChild(circle);
            amidaExecuting = false;
        }
    }

    function createCircle(baseSvgElement,itemColor,x,y) {
        let circleElement = document.createElementNS('http://www.w3.org/2000/svg','circle');
        circleElement.setAttribute('cx',x - strokeWidthOffset);
        circleElement.setAttribute('cy',y + circleWidth);
        circleElement.setAttribute('r',circleWidth);
        circleElement.setAttribute('fill',itemColor);
        baseSvgElement.appendChild(circleElement);                    
        return circleElement;
    }


    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    
    async function moveTo (element, line, linePathData, moveLineWidth,x,y,needOffset) {
        let xMovePlus = true;
        let yMovePlus = true;
        let nowX = Number(element.getAttribute('cx'));
        let nowY = Number(element.getAttribute('cy'));
        if( nowX > x)
            xMovePlus = false;
        if(nowY > y)
            yMovePlus = false;

        let moveLineX = 0;
        let moveLineY = 0;


        let isTaiki = true;

        const animate=()=>{
            let cx = Number(element.getAttribute('cx'));
            let newcx = cx;
            if(xMovePlus)
                newcx += moveSpeed;
            else
                newcx -= moveSpeed;

            let cy = Number(element.getAttribute('cy'));
            let newcy = cy;
            if(yMovePlus)
                newcy += moveSpeed;
            else
                newcy -= moveSpeed;

            if(xMovePlus && newcx > x){
                newcx = x;
            }
            else if(!xMovePlus && newcx < x){
                newcx = x;
            }

            if(yMovePlus && newcy > y)
                newcy = y;
            else if(!yMovePlus && newcy < y)
                newcy = y;

            moveLineX += newcx - cx;
            moveLineY += newcy - cy;

            let tempLinePathData = linePathData.concat();
            let offsetX = 0;
            if(needOffset)
                offsetX = preOffsetX;

            tempLinePathData.push({x:moveLineX + offsetX,y:moveLineY});
    
            element.setAttribute('cx',newcx);
            element.setAttribute('cy',newcy);
            moveLine(line,tempLinePathData, moveLineWidth);
          
            if(newcx == x && newcy == y){
                linePathData.push({x:moveLineX + offsetX,y:moveLineY});
                preOffsetX = 0;
                isTaiki = false;
            }else{
                requestAnimationFrame(animate);
            }
          }
          
          animate();

          while(isTaiki){
            await sleep(100);
          }
          return;

    }

    function createLineForMove(color,lineWidth){
        let lineElement = document.createElementNS('http://www.w3.org/2000/svg','path');
        lineElement.style.stroke = color;
        lineElement.style.strokeWidth = lineWidth;
        lineElement.setAttribute('fill','none');
        svgElement.appendChild(lineElement);  
        return lineElement;                   
    }

    function moveLine(lineElement,linePathData){
        let dText = 'm';
        let isFirst = true;
        linePathData.forEach(pathData => {
            if(isFirst)
                dText += (pathData.x + "," + pathData.y + " ");
            else {
                dText += ("l" + pathData.x + "," + pathData.y + " ");
            }
        });
        lineElement.setAttribute('d',dText);
    }

    function createAndAdVerticalLines(baseSvgElement,width,height,itemCount){

        let splitCount = itemCount * 2;
        let splitLineCount = itemCount * 2;
        let splitWidth = width / splitCount;
        let splitHeight = height / splitCount;

        splitLineXArray = [];
        splitLineYArray = [];
        let isRemove = false;
        for(let i = 1; i <= splitLineCount; i++){
            if(isRemove){
                isRemove = false;
            } else {
                isRemove = true;
                splitLineXArray.push(splitWidth * i);
            }
        }
        isRemove = false;
        for(let i = 1; i <= splitLineCount; i++){
            if(isRemove){
                isRemove = false;
            } else {
                isRemove = true;
                splitLineYArray.push(splitHeight * i);
            }
        }

        splitLineXArray.forEach(splitX => {
            let verticalLineElement = document.createElementNS('http://www.w3.org/2000/svg','line');
            verticalLineElement.setAttribute('x1',splitX - strokeWidth / 2);
            verticalLineElement.setAttribute('y1',0);
            verticalLineElement.setAttribute('x2',splitX - strokeWidth / 2);
            verticalLineElement.setAttribute('y2',height);
            verticalLineElement.style.stroke = amidaLineColor;
            verticalLineElement.style.strokeWidth = strokeWidth;
            baseSvgElement.appendChild(verticalLineElement);                    
        });


    }

    function createHorizontalLine(baseSvgElement,xStartIndex,xEndIndex,yIndex){
        let xStart = splitLineXArray[xStartIndex];
        let xEnd = splitLineXArray[xEndIndex];
        let y = splitLineYArray[yIndex];

        let verticalLineElement = document.createElementNS('http://www.w3.org/2000/svg','line');
        verticalLineElement.setAttribute('x1',xStart);
        verticalLineElement.setAttribute('y1',y - strokeWidthOffset);
        verticalLineElement.setAttribute('x2',xEnd);
        verticalLineElement.setAttribute('y2',y - strokeWidthOffset);
        verticalLineElement.style.stroke = amidaLineColor;
        verticalLineElement.style.strokeWidth = strokeWidth;
        baseSvgElement.appendChild(verticalLineElement);                    
    }

    window.addEventListener( 'resize', function() {
        createAmida(horizontalLine);
    }, false );

    createAmida(horizontalLine);

}.call(this));