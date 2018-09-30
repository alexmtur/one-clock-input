import {OneClass, html} from '@alexmtur/one-class'
import {oneStyle} from '@alexmtur/one-style'

export class OneClockInput extends OneClass {
    static get properties() {return {
        hour: {type: Number, public: true},     //0 - 23 
        minute: {type: Number, public: true},   //0 - 59 
        hourString: {type: String, public: true},     //0 - 23 
        minuteString: {type: String, public: true},   //0 - 59 
        amPm: {type: String, public: true},     //am - pm
    }}
    constructor() {
        super();  
        this.clockHours = [];
        this.clockMinutes = [];
        this.setupClock();
    }
    setupClock() {
        let timeObj = new Date();
        timeObj.setHours(timeObj.getHours() + 1);
        this.hour = timeObj.getHours();
        if(this.hour >= 12) this.amPm = 'pm'; else this.amPm = 'am';
        this.minute = 0;
        
        let amHourCells = [];
        let pmHourCells = [];
        let minuteCells = [];
        for (let i = 0; i < 12; i++) {
            amHourCells[i] = {};
            pmHourCells[i] = {};
            minuteCells[i] = {};
            amHourCells[i].hourValue = i;
            amHourCells[i].hourString = String(i);
            amHourCells[i].amPm = 'am';
            pmHourCells[i].hourValue = i + 12;
            pmHourCells[i].hourString = String(i + 12);
            pmHourCells[i].amPm = 'pm';
            minuteCells[i].minuteValue = i * 5;
            minuteCells[i].minuteString = String(i * 5);
            if(i < 2) {
                minuteCells[i].minuteString = '0' + minuteCells[i].minuteString;
            }
            if(i < 10) {
                amHourCells[i].hourString = '0' + amHourCells[i].hourString;
            }
            
        }
        this.clockHours[0] = amHourCells;
        this.clockHours[1] = pmHourCells;
        this.clockMinutes = minuteCells;
    }
    _propertiesChanged(props, changedProps, prevProps) {
        super._propertiesChanged(props, changedProps, prevProps);
        if(changedProps['hour'] !== undefined) {
            this.setHourString(changedProps['hour']);
        }
        if(changedProps['minute'] !== undefined) {
            this.setMinuteString(changedProps['minute']);
        }
    }
    setHourString(hour) {
        if(hour < 10) this.hourString = '0' + hour;
        else this.hourString = String(hour);
    }
    setMinuteString(minute) {
        if(minute < 10) this.minuteString = '0' + minute;
        else this.minuteString = String(minute);
    }
    selectHour(hourCell) {
        if(Math.abs(this.scrollDelta) > 5) return;
        this.hour = hourCell.hourValue;
        this.amPm = hourCell.amPm;
    }
    selectMinute(minuteCell) {
        this.minute = minuteCell.minuteValue;
    }
    selectAmPm(amPm) {
        this.amPm = amPm;
        if(amPm === 'am' && this.hour >= 12) this.hour -= 12;
        else if(amPm === 'pm' && this.hour <= 12) this.hour += 12;
        this.id('clockPage' + amPm).scrollIntoView({behavior: 'smooth'});
    }
    setupDrag(e) {
        e.preventDefault();
        this.mousedown = true;
        this.initialX = e.pageX;
        this.initialScrollX = this.id('hourPanel').scrollLeft;
        this.scrollDelta = 0;
        return false;
    }
    dragClockPage(e) {
        if(!this.mousedown) return;
        e.preventDefault();
        this.scrollDelta = this.initialX - e.pageX;
        this.id('hourPanel').scrollTo((this.scrollDelta + this.initialScrollX), 0);
    }
    updateClockPage(e) {
        e.preventDefault();
        if(this.mousedown) {
            let width = this.id('hourPanel').offsetWidth;
            if(this.scrollDelta > width / 2.5 && this.amPm === 'am') {
                this.selectAmPm('pm');
            }
            else if((-1) * this.scrollDelta > width / 2.5 && this.amPm === 'pm') { 
                this.selectAmPm('am');
            }
            else if(Math.abs(this.scrollDelta) > 0) 
                this.id('clockPage' + this.amPm).scrollIntoView({behavior: 'smooth'});           
            this.mousedown = false;
        }
    } 
    _firstRendered() {
        super._firstRendered();
        this.id('clockPage' + this.amPm).scrollIntoView();
    }
     _render() {
        return html`
        ${oneStyle}
        <style>
            /* local DOM styles go here */
            :host {
                display: block;
                color: #333;              
            }
            #digitalText {
                font-family: Digital !important;
                font-size: 430%;
                color: var(--one-color, #333);
            }
            #clock {
                display: flex;  
                flex-direction: column;              
                width: 100%; 
                max-width: 500px;
                min-width: 200px;
                flex: initial;
                flex-shrink: 1;
                flex-grow: 0;
            }
            #clockHeader {
                display: flex;  
                align-items: center;
                justify-content: space-between;              
            }
            #clockBody {
                position: relative;
                width: 100%; 
                display: flex; 
            }
            #hourPanel, #minutePanel {
                width: 100%; 
                overflow-x: hidden;
                display: flex; 
                box-shadow: 0 2px 7px rgba(0, 0, 0, 0.25);
            }
            #amPm {
                box-shadow: 0 2px 7px rgba(0, 0, 0, 0.25);
                margin-bottom: 10px;
                display: flex;
                max-width: 150px;              
            }
            .amPmButton {
                font-size: 120%;
                cursor: pointer;
                padding: 10px;
                color: #bbb;
                flex: 1;
               
            }
            .amPmButton[selected=true] {
                color: white;
                background: var(--one-color, #333);
            }
            .blink {
                animation: blink 1s step-start 0s infinite;
            }
            @keyframes blink {
              50% {
                opacity: 0;
              }
            }
            .clockPage { 
                min-width: 100%;  
                display: flex;                 
                z-index: 0;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
            }
            .cell {
                width:25%;
                height: 8vh;
                -webkit-transition: background .5s ease;
                -moz-transition: background .5s ease;
                border-radius: 100%;
                cursor: pointer;
                display: flex;                 
                justify-content: center;
                align-items: center;
            }            
            .cell[selected=true] .time, .time:hover {
                background: var(--one-color, #333);
                color: white;
            }  
            .cell:hover {
                opacity: 0.5;                
            } 
            .cell:active {
                opacity: 1
            }                     
            .cell[currentMonth=false] .time {
                color: #bbb;
            }
            .time {
                width: 6vh;
                height: 6vh;
                border-radius: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            #dots {
                display: flex; 
                align-items: center; 
                justify-content: center; 
                flex-direction: column;
            }
            .dot {
                height: 8px; 
                width: 8px; 
                background: var(--one-color, #333); 
                margin:10px; 
                border-radius: 0%;
            }
            #hourText {
                height: 100%;
                width: 100%;
                
                position: absolute;
                font-size: 20vh;
                font-family: Digital !important;
                font-weight: normal;
                font-style: normal;
                opacity: 0.3;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                transform: scaleX(0.5);
            }

        </style>

        <div id="clock"> 
            <div id="clockHeader">       
                <div id="amPm">
                    <div class="amPmButton" selected=${this.amPm === 'am' ? true : false} @click=${(e)=>{this.selectAmPm('am')}}>am</div>  
                    <div class="amPmButton" selected=${this.amPm === 'pm' ? true : false} @click=${(e)=>{this.selectAmPm('pm')}}>pm</div>                 
                </div> 
                <div id="digitalText">
                    ${this.hourString}:${this.minuteString}
                </div> 
            </div>
            <div id="clockBody">              
                <div id="hourPanel" 
                    @mousedown=${(e)=>{this.setupDrag(e)}}    
                    @mousemove=${(e)=>{this.dragClockPage(e)}}
                    @mouseup=${(e)=>{this.updateClockPage(e)}}>
                    ${this.clockHours.map((hourCells, index) => 
                        html`<div class="clockPage" id=${'clockPage' + hourCells[0].amPm}>
                            ${hourCells.map((hourCell) => html`<div class="cell"
                                selected=${hourCell.hourValue === this.hour && hourCell.amPm === this.amPm ? true : false} 
                                @click=${(e)=>{this.selectHour(hourCell)}}><div class="time">${hourCell.hourString}</div></div>`)}
                        
                        </div>`)}              
                </div>
                <div class="blink" id="dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <div id="minutePanel">
                    <div class="clockPage">
                            ${this.clockMinutes.map((minuteCell) => html`<div class="cell"
                                selected=${minuteCell.minuteValue === this.minute ? true : false} 
                                @click=${(e)=>{this.selectMinute(minuteCell)}}><div class="time">${minuteCell.minuteString}</div></div>`)}
                    </div>                
                </div>  
            </div>   
        </div>
        `;}
}
customElements.define('one-clock-input', OneClockInput);


