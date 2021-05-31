import React, {useState, useEffect} from 'react';
import {Select, Modal, Slider, Button, TimePicker, InputNumber, Calendar, Progress} from "antd";
import moment from 'moment';
import {CloseCircleOutlined} from "@ant-design/icons";
import { Bar } from 'react-chartjs-2';
const App = () => {
    const format = 'HH:mm';
    const [gender, setGender] = useState('men');
    const [mas, setMas] = useState(80);
    const [activeTime, setActiveTime] = useState(16);
    const [activeTime2, setActiveTime2] = useState(16);
    const [newPortion, setNewPortion] = useState(300);
    const [time, setTime] = useState('12:00');
    const [data, setData] = useState([]);
    const [day, setDay] = useState(new Date().toISOString().substr(0, 10));
    const [dayNorm, setDayNorm] = useState(0);
    const [dayDrunk, setDayDrunk] = useState(0);
    const [activity, setActivity] = useState('1');
    const [weather, setWeather] = useState('1'); 
    const [dataWeek, setDataWeek] = useState([]); 
    function addNewPortion() {
        setData([...data, {id: new Date(), portion: newPortion, day, time}])
    }
    function removePortion(id){
        const index = data.findIndex(item => item.id === id);
        const f1 = data.slice(0, index); 
        const f2 = data.slice(index+1); 
        setData([...f1, ...f2]);
    }
    useEffect(()=> { 
        localStorage.getItem('data') && setData(JSON.parse(localStorage.getItem('data')));
        localStorage.getItem('gender') && setGender(localStorage.getItem('gender'));
        localStorage.getItem('mas') && setMas(+localStorage.getItem('mas'));
        localStorage.getItem('activeTime') && setActiveTime(+localStorage.getItem('activeTime'));
        localStorage.getItem('activity') && setActivity(localStorage.getItem('activity'));
        localStorage.getItem('weather') && setWeather(localStorage.getItem('weather'));
    }, []);
    useEffect(()=>{
        if (gender === 'men') {
            setDayNorm(((0.03 * mas + activeTime * 0.5)*+activity*+weather).toFixed(1)); 
        } else {
            setDayNorm(((0.025 * mas + activeTime * 0.4)*+activity*+weather).toFixed(1));
        }
        localStorage.setItem('gender', gender);
        localStorage.setItem('mas', mas.toString());//
        localStorage.setItem('activeTime', activeTime.toString());
        localStorage.setItem('activity', activity);
        localStorage.setItem('weather', weather);
    }, [gender, mas, activeTime, activity, weather]);
    useEffect(()=> {
        let sum = 0; 
        data?.filter(item => item.day === day).map(item => {
            sum += item.portion;
            return sum;
        })
        setDayDrunk(sum/1000);
    }, [day, data]);
    useEffect(()=> {
        localStorage.setItem('data', JSON.stringify(data));
    }, [data]);
    useEffect(()=> {
        let dataWeekNew = [];
        for(let i = 0; i<30; i++) { 
            let sum = 0; 
            const day = moment().add(-(i), 'day').format('YYYY-MM-DD');
            data?.filter(item => item.day === day).map(item => {
                sum += item.portion;
                return sum;
            })
            dataWeekNew[i] = {day, sum}
        }
        setDataWeek(dataWeekNew.reverse()); 
    }, [data]);
    function info() {
        Modal.info({
            title: 'Рекомендации',
            content: (
                <div>
                    <p>1. Выпивайте стакан воды медленно небольшими глотками</p>
                    <p>2. Задерживайте воду во рту на некоторое время перед тем, как проглотить</p>
                    <p>3. Пить воду лучше сидя, нежели в положении стоя или на ходу</p>
                    <p>4. Не пейте холодную или ледяную воду</p>
                    <p>5. Не пейте воду сразу после еды</p>
                    <p>6. Не пейте холодную воду сразу после горячих напитков</p>
                    <p>7. Всегда пейте воду перед мочеиспусканием, но не пейте воду сразу после мочеиспускания</p>
                </div>
            ),
            onOk() {},
        });
    }
    return (
        <div className='container'>
            <h1>
            КАЛЬКУЛЯТОР РАСЧЕТА НОРМЫ ВОДЫ НА ДЕНЬ ДЛЯ ЧЕЛОВЕКА
            </h1>
            <div className="row">
                <Progress 
                    strokeColor={{
                        from: '#108ee9',
                        to: '#87d068',
                    }}
                    percent={(dayDrunk/dayNorm*100).toFixed(1)} 
                    status="active"
                />
                <div className="col-xl-4 col-md-6 col-sm-12 mb-5">
                    <h4>Ваш пол:</h4>
                    <Select value={gender} style={{width: '100%'}} onChange={(e) => setGender(e)} > 
                        <Select.Option value="men">Мужской</Select.Option>
                        <Select.Option value="women">Женский</Select.Option>
                    </Select>
                    <h4>Ваш вес: {mas + ' кг'}</h4> 
                    <Slider value={mas} max={200} min={30} onChange={(e) => setMas(e)}/>
                    <h4>Физическая нагрузка: {activeTime + ' ч'}</h4>
                    <Slider value={activeTime} max={10} min={0} onChange={(e) => setActiveTime(e)}/>
                    <h4>Уровень дневной активности:</h4>
                    <Select value={activity} style={{width: '100%'}} onChange={(e) => setActivity(e)} > 
                        <Select.Option value="0.9">Слабый (до 5 000 шагов)</Select.Option>
                        <Select.Option value="1">Средний (до 8 000 шагов)</Select.Option>
                        <Select.Option value="1.2">Высокий (более 8000 шагов)</Select.Option>
                    </Select>
                    <h4>Температура окружающей среды:</h4>
                    <Select value={weather} style={{width: '100%'}} onChange={(e) => setWeather(e)} > 
                        <Select.Option value="0.9">Холодная погода (менее 10°)</Select.Option>
                        <Select.Option value="1">Теплая погода (+11°..+15°)</Select.Option>
                        <Select.Option value="1.3">Жаркая погода (более +15°)</Select.Option>
                    </Select>
                    <h5 className='text-muted'>Норма воды на день: {dayNorm} л</h5>
                </div>
                <div className="col-xl-4 col-md-6 col-sm-12 mb-5">
                    <h4>Время бодрствования: {activeTime2} ч</h4>
                    <Slider value={activeTime2} max={24} min={0} onChange={(e) => setActiveTime2(e)}/>
                    <h5 className='text-muted'>Пейте по стакану воды (300мл) <p>каждые {(60/((dayNorm/activeTime2)/0.3)).toFixed(0)} минут</p></h5>
                    <Button className='mt-3 mb-1' style={{width: '100%'}} size='large' onClick={info}>Рекомендации</Button>
                </div>
                <div className="col-xl-4 col-md-6 col-sm-12 mb-5">
                    <h4>Выберите время и количество выпитой воды</h4>
                    <Calendar value={moment(day)} fullscreen={false} onSelect={e => setDay(e.format('YYYY-MM-DD'))}/> 
                    <div className='d-flex'>
                        <TimePicker allowClear={false} value={moment(time, format)} onChange={(e) => {
                            setTime(e.format('HH:mm'));
                        }} format={format}/> 
                        <InputNumber min={1} max={2000} value={newPortion} onChange={e => setNewPortion(e)} 
                                     placeholder='Кол-во мл'/>
                        <Button onClick={() => addNewPortion()}>Добавить</Button>
                    </div>
                    <div>
                        {data?.filter(e => e.day === day).map(item => { 
                            return (
                                <div key={item.id} className='d-flex justify-content-between align-items-center'>
                                    <h4 >{item.time} - {item.portion + ' мл'} </h4>
                                    <CloseCircleOutlined onClick={()=>removePortion(item.id)} />
                                </div>
                            )
                        })}
                    </div>
                    <h5>Всего за день: {dayDrunk} л</h5> 
                </div>
            </div>
            <h4>Статистика за последний месяц:</h4>
                    <Bar data={{ //График
                        labels: dataWeek.map(item => item.day),
                        datasets: [{
                            label: 'Выпито',
                            data: dataWeek.map(item => item.sum/1000),
                        }]
                    }}/>
        </div>
    );
};

export default App;
