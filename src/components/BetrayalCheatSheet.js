import React from 'react';
import Button from 'react-bootstrap/Button';
import zlib from 'zlib';
import {BlockPicker} from 'react-color';
import './BetrayalCheatSheet.css';

const TABLE_ROW_SIZE = 5;
const TABLE_COL_SIZE = 18;

class BetrayalCheatSheet extends React.Component {
    constructor() {
        super();
        this.state = {
            colourOne: localStorage.getItem('colourOne') ? localStorage.getItem('colourOne') : '#004401',
            colourTwo: localStorage.getItem('colourTwo') ? localStorage.getItem('colourTwo') : '#734a00',
            colourThree: localStorage.getItem('colourThree') ? localStorage.getItem('colourThree') : '#590000'
        };

        if (window.location.hash.includes('share=')) {
            try {
                this.state.selected = JSON.parse(zlib.gunzipSync(Buffer.from(decodeURIComponent(window.location.hash.split('share=')[1]), 'base64')).toString());
            } catch(e) {
                alert('Failed to load shared data');
                this.state.selected = Array(TABLE_ROW_SIZE*TABLE_COL_SIZE).fill(0);
            }
        } else {
            this.state.selected = localStorage.getItem('selected') ? JSON.parse(localStorage.getItem('selected')) : Array(TABLE_ROW_SIZE*TABLE_COL_SIZE).fill(0);
        }

        void(localStorage.getItem('colourOne') && this.updateCSS(this.state.colourOne, '.colourOne'));
        void(localStorage.getItem('colourTwo') && this.updateCSS(this.state.colourTwo, '.colourTwo'));
        void(localStorage.getItem('colourThree') && this.updateCSS(this.state.colourThree, '.colourThree'));
    }

    clearSelected = (e) => {
        this.setState({selected: Array(TABLE_ROW_SIZE*TABLE_COL_SIZE).fill(0)});
    };

    shareSelected = () => {
        const share_id = zlib.gzipSync(Buffer.from(JSON.stringify(this.state.selected)));
        const textArea = document.createElement('textarea');
        textArea.style.background = 'transparent';
        textArea.value = "https://poetools.github.io/BetrayalCheatSheet/#share=" + encodeURIComponent(share_id.toString('base64'));
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('Copy');
            document.body.removeChild(textArea);
            alert('Successfully copied to clipboard.');
        } catch(e) {
            document.body.removeChild(textArea);
            alert('Failed to copy to clipboard.');
        }
    };

    // Changes cell colour
    handleClickEvent = (e) => {
        let cell = e.target;
        while (cell && cell.tagName) {
            if (cell.tagName === 'TD') {
                break;
            }
            cell = cell.parentElement;
        }
        if (!cell) {
            return;
        }

        // Updates state
        const row = parseInt(cell.id[1]);
        const col = parseInt(cell.id.substring(2));
        const tempState = [...this.state.selected];
        tempState[row*TABLE_COL_SIZE + col] = (tempState[row*TABLE_COL_SIZE + col] + 1)%4;
        this.setState({selected: tempState});
    };

    handleChangeComplete = (colour, colourNo) => {
        this.setState({[colourNo]: colour.hex});
        localStorage.setItem(colourNo, colour.hex);
        const classSelector = '.' + colourNo;
        this.updateCSS(colour.hex, classSelector);
    };

    updateCSS = (colour, selector) => {
        for (let i = 0; i < document.styleSheets.length; i++) {
            for(let j = 0; j < document.styleSheets[i].cssRules.length; j++) {
                if(document.styleSheets[i].cssRules[j].selectorText === selector) {
                    document.styleSheets[i].deleteRule(j);
                    document.styleSheets[i].insertRule(`${selector} {background-color:${colour};}`);
                    return;
                }
            }
        }
    };

    render() {
        return (
            <div id='betrayal-cheatSheet'>
                <section id='landing-description'>
                    <h1>
                        Path of Exile - Syndicate Cheat Sheet
                    </h1>
                    <h2>
                        An interactive tool that lets you highlight Betrayal/Syndicate rewards for easy reference. Click a square below to get started.
                    </h2>
                </section>
                <section id='cheatsheet-table'>
                    <BetrayalTable onClick={this.handleClickEvent} selected={this.state.selected}/>
                </section>
                <section id='colour-selectors'>
                    <div id='colour-float-div'>
                        <div id='colour-one'>
                            <h1>Great</h1>
                            <BlockPicker
                                color={this.state.colourOne}
                                colors={['#004401', '#004f01', '#006601', '#007a01', '#008c01']}
                                onChangeComplete={(e) => this.handleChangeComplete(e, 'colourOne')}
                            />
                        </div>
                        <div id='colour-two'>
                            <h1>Maybe</h1>
                            <BlockPicker
                                color={this.state.colourTwo}
                                colors={['#734a00', '#8a5900', '#a86d00', '#c27e00', '#e69500']}
                                onChangeComplete={(e) => this.handleChangeComplete(e, 'colourTwo')}
                            />
                        </div>
                        <div id='colour-three'>
                            <h1>Ignore</h1>
                            <BlockPicker
                                color={this.state.colourThree}
                                colors={['#590000', '#690000', '#780000', '#870000', '#9e0000']}
                                onChangeComplete={(e) => this.handleChangeComplete(e, 'colourThree')}
                            />
                        </div>
                    </div>
                </section>
                <section id='community-widgets'>
                    <div id='community-flex-div'>
                        <Button id='share' variant='primary' size='lg' onClick={this.shareSelected}>
                            Share
                        </Button>
                        <Button id='clear' variant='danger' size='lg' onClick={this.clearSelected}>
                            Clear
                        </Button>
                    </div>
                </section>
                <section id='footer'>
                    <h2>
                        Last updated for 3.20. Made by Multigrain and <a href="https://github.com/poetools/BetrayalCheatSheet/graphs/contributors">others</a>.
                    </h2>
                    <p class="source-code"><a href={'https://github.com/poetools/BetrayalCheatSheet'}>Source Code</a></p>
                </section>
            </div>
        );
    }
}

class BetrayalTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: this.props.selected
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.selected !== this.state.selected) {
            this.setState({selected: this.state.selected});
            localStorage.setItem('selected', JSON.stringify(this.state.selected));
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.selected !== prevState.selected) {
            return {selected: nextProps.selected}
        }
        else return null;
    }

    render() {
        return (
            <table id='syndicate-table' onClick={this.props.onClick}>
                <thead>
                <tr>
                    <BetrayalTableHeader img={''} alt={''} description={""} id={'t00'} colourID={this.state.selected[0]}/>
                    <BetrayalTableHeader img={'assets/members/Aisling.png'} alt={'爱斯林'} description={"爱斯林"} id={'t01'} colourID={this.state.selected[1]}/>
                    <BetrayalTableHeader img={'assets/members/Cameria.png'} alt={'卡美利亚'} description={"卡美利亚"} id={'t02'} colourID={this.state.selected[2]}/>
                    <BetrayalTableHeader img={'assets/members/Elreon.png'} alt={'艾尔雷恩'} description={"艾尔雷恩"} id={'t03'} colourID={this.state.selected[3]}/>
                    <BetrayalTableHeader img={'assets/members/Gravicius.png'} alt={'格拉维奇'} description={"格拉维奇"} id={'t04'} colourID={this.state.selected[4]}/>
                    <BetrayalTableHeader img={'assets/members/Guff.png'} alt={'古夫'} description={"古夫"} id={'t05'} colourID={this.state.selected[5]}/>
                    <BetrayalTableHeader img={'assets/members/Haku.png'} alt={'哈库'} description={"哈库"} id={'t06'} colourID={this.state.selected[6]}/>
                    <BetrayalTableHeader img={'assets/members/Hillock.png'} alt={'西拉克'} description={"西拉克"} id={'t07'} colourID={this.state.selected[7]}/>
                    <BetrayalTableHeader img={'assets/members/It_That_Fled.png'} alt={'逃逸怪'} description={"逃逸怪"} id={'t08'} colourID={this.state.selected[8]}/>
                    <BetrayalTableHeader img={'assets/members/Janus.png'} alt={'杨纳斯'} description={"杨纳斯"} id={'t09'} colourID={this.state.selected[9]}/>
                    <BetrayalTableHeader img={'assets/members/Jorgin.png'} alt={'尤尔金'} description={"尤尔金"} id={'t010'} colourID={this.state.selected[10]}/>
                    <BetrayalTableHeader img={'assets/members/Korell.png'} alt={'库欧'} description={"库欧"} id={'t011'} colourID={this.state.selected[11]}/>
                    <BetrayalTableHeader img={'assets/members/Leo.png'} alt={'里奥'} description={"里奥"} id={'t012'} colourID={this.state.selected[12]}/>
                    <BetrayalTableHeader img={'assets/members/Riker.png'} alt={'莱克'} description={"莱克"} id={'t013'} colourID={this.state.selected[13]}/>
                    <BetrayalTableHeader img={'assets/members/Rin.png'} alt={'麟'} description={"麟"} id={'t014'} colourID={this.state.selected[14]}/>
                    <BetrayalTableHeader img={'assets/members/Tora.png'} alt={'托拉'} description={"托拉"} id={'t015'} colourID={this.state.selected[15]}/>
                    <BetrayalTableHeader img={'assets/members/Vagan.png'} alt={'瓦甘'} description={"瓦甘"} id={'t016'} colourID={this.state.selected[16]}/>
                    <BetrayalTableHeader img={'assets/members/Vorici.png'} alt={'瓦里西'} description={"瓦里西"} id={'t017'} colourID={this.state.selected[17]}/>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <BetrayalTableCell img={'assets/locations/1transport.png'} alt={'运输部'} description={""} id={'t10'} colourID={this.state.selected[TABLE_COL_SIZE]}/>
                    <BetrayalTableCell img={'assets/encounters/aisling/1transport.png'} alt={'运输部'} description={"双重隐匿武器/珠宝"} id={'t11'} colourID={this.state.selected[TABLE_COL_SIZE + 1]}/>
                    <BetrayalTableCell img={'assets/encounters/cameria/1transport.png'} alt={'运输部'} description={"1 赛季限定传奇"} id={'t12'} colourID={this.state.selected[TABLE_COL_SIZE + 2]}/>
                    <BetrayalTableCell img={'assets/encounters/elreon/1transport.png'} alt={'运输部'} description={"1/2/3 传奇武器"} id={'t13'} colourID={this.state.selected[TABLE_COL_SIZE + 3]}/>
                    <BetrayalTableCell img={'assets/encounters/gravicius/1transport.png'} alt={'运输部'} description={"完整命运卡组"} id={'t14'} colourID={this.state.selected[TABLE_COL_SIZE + 4]}/>
                    <BetrayalTableCell img={'assets/encounters/guff/1transport.png'} alt={'运输部'} description={"限时制作"} id={'t15'} colourID={this.state.selected[TABLE_COL_SIZE + 5]}/>
                    <BetrayalTableCell img={'assets/encounters/haku/1transport.png'} alt={'运输部'} description={"稀有物品"} id={'t16'} colourID={this.state.selected[TABLE_COL_SIZE + 6]}/>
                    <BetrayalTableCell img={'assets/encounters/hillock/1transport.png'} alt={'运输部'} description={"24/26/28/30 武器品质"} id={'t17'} colourID={this.state.selected[TABLE_COL_SIZE + 7]}/>
                    <BetrayalTableCell img={'assets/encounters/it_that_fled/1transport.png'} alt={'运输部'} description={"裂隙碎片"} id={'t18'} colourID={this.state.selected[TABLE_COL_SIZE + 8]}/>
                    <BetrayalTableCell img={'assets/encounters/janus/1transport.png'} alt={'运输部'} description={"品质通货"} id={'t19'} colourID={this.state.selected[TABLE_COL_SIZE + 9]}/>
                    <BetrayalTableCell img={'assets/encounters/jorgin/1transport.png'} alt={'运输部'} description={"1/2/3\n魔符"} id={'t110'} colourID={this.state.selected[TABLE_COL_SIZE + 10]}/>
                    <BetrayalTableCell img={'assets/encounters/korell/1transport.png'} alt={'运输部'} description={"精华"} id={'t111'} colourID={this.state.selected[TABLE_COL_SIZE + 11]}/>
                    <BetrayalTableCell img={'assets/encounters/leo/1transport.png'} alt={'运输部'} description={"催化剂"} id={'t112'} colourID={this.state.selected[TABLE_COL_SIZE + 12]}/>
                    <BetrayalTableCell img={'assets/encounters/riker/1transport.png'} alt={'运输部'} description={"限时选通货"} id={'t113'} colourID={this.state.selected[TABLE_COL_SIZE + 13]}/>
                    <BetrayalTableCell img={'assets/encounters/rin/1transport.png'} alt={'运输部'} description={"地图"} id={'t114'} colourID={this.state.selected[TABLE_COL_SIZE + 14]}/>
                    <BetrayalTableCell img={'assets/encounters/tora/1transport.png'} alt={'运输部'} description={"限时选物品"} id={'t115'} colourID={this.state.selected[TABLE_COL_SIZE + 15]}/>
                    <BetrayalTableCell img={'assets/encounters/vagan/1transport.png'} alt={'运输部'} description={"军团碎片"} id={'t116'} colourID={this.state.selected[TABLE_COL_SIZE + 16]}/>
                    <BetrayalTableCell img={'assets/encounters/vorici/1transport.png'} alt={'运输部'} description={"随机品质宝石"} id={'t117'} colourID={this.state.selected[TABLE_COL_SIZE + 17]}/>
                </tr>
                <tr>
                    <BetrayalTableCell img={'assets/locations/2fortification.png'} alt={'防卫部'} description={""} id={'t20'} colourID={this.state.selected[TABLE_COL_SIZE*2]}/>
                    <BetrayalTableCell img={'assets/encounters/aisling/2fort.png'} alt={'防卫部'} description={"双重隐匿护甲/珠宝"} id={'t21'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 1]}/>
                    <BetrayalTableCell img={'assets/encounters/cameria/2fort.png'} alt={'防卫部'} description={"先驱通货"} id={'t22'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 2]}/>
                    <BetrayalTableCell img={'assets/encounters/elreon/2fort.png'} alt={'防卫部'} description={"1/2/3 传奇护甲"} id={'t23'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 3]}/>
                    <BetrayalTableCell img={'assets/encounters/gravicius/2fort.png'} alt={'防卫部'} description={"随机命运卡"} id={'t24'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 4]}/>
                    <BetrayalTableCell img={'assets/encounters/guff/2fort.png'} alt={'防卫部'} description={"限时制作"} id={'t25'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 5]}/>
                    <BetrayalTableCell img={'assets/encounters/haku/2fort.png'} alt={'防卫部'} description={"魔法/稀有/传奇 保险箱"} id={'t26'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 6]}/>
                    <BetrayalTableCell img={'assets/encounters/hillock/2fort.png'} alt={'防卫部'} description={"24/26/28/30 护甲品质"} id={'t27'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 7]}/>
                    <BetrayalTableCell img={'assets/encounters/it_that_fled/2fort.png'} alt={'防卫部'} description={"附魔地图 (裂隙)"} id={'t28'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 8]}/>
                    <BetrayalTableCell img={'assets/encounters/janus/2fort.png'} alt={'防卫部'} description={"通货碎片"} id={'t29'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 9]}/>
                    <BetrayalTableCell img={'assets/encounters/jorgin/2fort.png'} alt={'防卫部'} description={"1/2/3 有兽之势词缀的稀有物品"} id={'t210'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 10]}/>
                    <BetrayalTableCell img={'assets/encounters/korell/2fort.png'} alt={'防卫部'} description={"地图碎片"} id={'t211'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 11]}/>
                    <BetrayalTableCell img={'assets/encounters/leo/2fort.png'} alt={'防卫部'} description={"随机通货"} id={'t212'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 12]}/>
                    <BetrayalTableCell img={'assets/encounters/riker/2fort.png'} alt={'防卫部'} description={"限时选传奇"} id={'t213'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 13]}/>
                    <BetrayalTableCell img={'assets/encounters/rin/2fort.png'} alt={'防卫部'} description={"稀有地图"} id={'t214'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 14]}/>
                    <BetrayalTableCell img={'assets/encounters/tora/2fort.png'} alt={'防卫部'} description={"迷宫附魔的 手/鞋/头"} id={'t215'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 15]}/>
                    <BetrayalTableCell img={'assets/encounters/vagan/2fort.png'} alt={'防卫部'} description={"军团箱子"} id={'t216'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 16]}/>
                    <BetrayalTableCell img={'assets/encounters/vorici/2fort.png'} alt={'防卫部'} description={"插槽通货"} id={'t217'} colourID={this.state.selected[TABLE_COL_SIZE*2 + 17]}/>
                </tr>
                <tr>
                    <BetrayalTableCell img={'assets/locations/3research.png'} alt={'科研部'} description={""} id={'t30'} colourID={this.state.selected[TABLE_COL_SIZE*3]}/>
                    <BetrayalTableCell img={'assets/encounters/aisling/3research.png'} alt={'科研部'} description={"加密混沌石\nT4: 去掉一个随机词缀，增加一个隐匿词缀"} id={'t31'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 1]}/>
                    <BetrayalTableCell img={'assets/encounters/cameria/3research.png'} alt={'科研部'} description={"粉碎石"} id={'t32'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 2]}/>
                    <BetrayalTableCell img={'assets/encounters/elreon/3research.png'} alt={'科研部'} description={"1/2/3 传奇首饰"} id={'t33'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 3]}/>
                    <BetrayalTableCell img={'assets/encounters/gravicius/3research.png'} alt={'科研部'} description={"随机命运卡替换"} id={'t34'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 4]}/>
                    <BetrayalTableCell img={'assets/encounters/guff/3research.png'} alt={'科研部'} description={"限时制作"} id={'t35'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 5]}/>
                    <BetrayalTableCell img={'assets/encounters/haku/3research.png'} alt={'科研部'} description={"有品质的稀有物品"} id={'t36'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 6]}/>
                    <BetrayalTableCell img={'assets/encounters/hillock/3research.png'} alt={'科研部'} description={"22/24/26/28 药剂品质"} id={'t37'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 7]}/>
                    <BetrayalTableCell img={'assets/encounters/it_that_fled/3research.png'} alt={'科研部'} description={"T1/T2/T3/2xT3 升级裂隙石"} id={'t38'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 8]}/>
                    <BetrayalTableCell img={'assets/encounters/janus/3research.png'} alt={'科研部'} description={"先祖秘藏通货"} id={'t39'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 9]}/>
                    <BetrayalTableCell img={'assets/encounters/jorgin/3research.png'} alt={'科研部'} description={"T1/T2/T3 腐化项链转魔符"} id={'t310'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 10]}/>
                    <BetrayalTableCell img={'assets/encounters/korell/3research.png'} alt={'科研部'} description={"化石"} id={'t311'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 11]}/>
                    <BetrayalTableCell img={'assets/encounters/leo/3research.png'} alt={'科研部'} description={"重置插槽 颜色/数量/链接"} id={'t312'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 12]}/>
                    <BetrayalTableCell img={'assets/encounters/riker/3research.png'} alt={'科研部'} description={"限时选裂隙碎片/精华/化石/催化剂"} id={'t313'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 13]}/>
                    <BetrayalTableCell img={'assets/encounters/rin/3research.png'} alt={'科研部'} description={"传奇地图"} id={'t314'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 14]}/>
                    <BetrayalTableCell img={'assets/encounters/tora/3research.png'} alt={'科研部'} description={"20/70/200M 宝石经验"} id={'t315'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 15]}/>
                    <BetrayalTableCell img={'assets/encounters/vagan/3research.png'} alt={'科研部'} description={"孕育石"} id={'t316'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 16]}/>
                    <BetrayalTableCell img={'assets/encounters/vorici/3research.png'} alt={'科研部'} description={"1/1-2/1-3/1-6 白色插槽"} id={'t317'} colourID={this.state.selected[TABLE_COL_SIZE*3 + 17]}/>
                </tr>
                <tr>
                    <BetrayalTableCell img={'assets/locations/4intervention.png'} alt={'调停部'} description={""} id={'t40'} colourID={this.state.selected[TABLE_COL_SIZE*4]}/>
                    <BetrayalTableCell img={'assets/encounters/aisling/4intervention.png'} alt={'调停部'} description={"苦痛(罪魂)\n圣甲虫"} id={'t41'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 1]}/>
                    <BetrayalTableCell img={'assets/encounters/cameria/4intervention.png'} alt={'调停部'} description={"亚硫酸\n圣甲虫"} id={'t42'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 2]}/>
                    <BetrayalTableCell img={'assets/encounters/elreon/4intervention.png'} alt={'调停部'} description={"遗物厅(传奇)\n圣甲虫"} id={'t43'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 3]}/>
                    <BetrayalTableCell img={'assets/encounters/gravicius/4intervention.png'} alt={'调停部'} description={"神恩(命运卡)\n圣甲虫"} id={'t44'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 4]}/>
                    <BetrayalTableCell img={'assets/encounters/guff/4intervention.png'} alt={'调停部'} description={"限时制作"} id={'t45'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 5]}/>
                    <BetrayalTableCell img={'assets/encounters/haku/4intervention.png'} alt={'调停部'} description={"强袭(保险箱)\n圣甲虫"} id={'t46'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 6]}/>
                    <BetrayalTableCell img={'assets/encounters/hillock/4intervention.png'} alt={'调停部'} description={"深渊\n圣甲虫"} id={'t47'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 7]}/>
                    <BetrayalTableCell img={'assets/encounters/it_that_fled/4intervention.png'} alt={'调停部'} description={"裂隙\n圣甲虫"} id={'t48'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 8]}/>
                    <BetrayalTableCell img={'assets/encounters/janus/4intervention.png'} alt={'调停部'} description={"先祖秘藏\n圣甲虫"} id={'t49'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 9]}/>
                    <BetrayalTableCell img={'assets/encounters/jorgin/4intervention.png'} alt={'调停部'} description={"猎魔(野兽)\n圣甲虫"} id={'t410'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 10]}/>
                    <BetrayalTableCell img={'assets/encounters/korell/4intervention.png'} alt={'调停部'} description={"裂界者\n圣甲虫"} id={'t411'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 11]}/>
                    <BetrayalTableCell img={'assets/encounters/leo/4intervention.png'} alt={'调停部'} description={"灾变\n圣甲虫"} id={'t412'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 12]}/>
                    <BetrayalTableCell img={'assets/encounters/riker/4intervention.png'} alt={'调停部'} description={"菌潮\n圣甲虫"} id={'t413'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 13]}/>
                    <BetrayalTableCell img={'assets/encounters/rin/4intervention.png'} alt={'调停部'} description={"制图者\n圣甲虫"} id={'t414'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 14]}/>
                    <BetrayalTableCell img={'assets/encounters/tora/4intervention.png'} alt={'调停部'} description={"先驱\n圣甲虫"} id={'t415'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 15]}/>
                    <BetrayalTableCell img={'assets/encounters/vagan/4intervention.png'} alt={'调停部'} description={"军团\n圣甲虫"} id={'t416'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 16]}/>
                    <BetrayalTableCell img={'assets/encounters/vorici/4intervention.png'} alt={'调停部'} description={"塑界者\n圣甲虫"} id={'t417'} colourID={this.state.selected[TABLE_COL_SIZE*4 + 17]}/>
                </tr>
                </tbody>
            </table>
        );
    }
}

// Workaround for https://github.com/facebook/create-react-app/issues/9992
function publicFile(assetPath) {
    if (assetPath == null || assetPath === '') {
        return '';
    }
    return require(`../../public/${assetPath}`)?.default;
}

class BetrayalTableCell extends React.Component {
    colourList = ['', 'colourOne', 'colourTwo', 'colourThree'];

    constructor(props) {
        super(props);
        this.state = {
            colourID: this.props.colourID
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.colourID !== this.state.colourID) {
            this.setState({colourID: this.state.colourID});
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.colourID !== prevState.colourID) {
            return {colourID: nextProps.colourID}
        }
        else return null;
    }

    render() {
        const key = this.props.description;
        return (
            <td className={this.colourList[this.state.colourID]} id={this.props.id}><img src={publicFile(this.props.img)} alt={this.props.alt} className="select-disable"/>
                {this.props.description.split('\n').map(x => {
                    return <p key={key + x}>{x.replace(/\//g, '/\u200B')}</p>;
                })}
            </td>
        );
    }
}

class BetrayalTableHeader extends React.Component {
    colourList = ['', 'colourOne', 'colourTwo', 'colourThree'];

    constructor(props) {
        super(props);
        this.state = {
            colourID: this.props.colourID
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.colourID !== this.state.colourID) {
            this.setState({colourID: this.state.colourID});
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.colourID !== prevState.colourID) {
            return {colourID: nextProps.colourID}
        }
        else return null;
    }

    render() {
        return (
            <td className={this.colourList[this.state.colourID]} id={this.props.id}><img src={publicFile(this.props.img)} alt={this.props.alt} className="select-disable"/>
                <h1>
                    {this.props.description}
                </h1>
            </td>
        );
    }
}

export default BetrayalCheatSheet;
