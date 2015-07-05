$(document).ready(function () {

    var i = 0;
    var num = 0;
    var num_buf = 0;

    var radius = 180;
    var time_holder;
    var round_class;

    var x;
    var y;

    // Динамические переменные для таймера.
    var status = 'wait';				//
    var status_buffer = 'wait';			//	Предыдущее значение статуса хранится в памяти
    var dt = 0;							//	10мс
    var count = 0;						//	отсчет в упражнении
    var rest_count = 0;					//	отсчет отдыха (счетчик для пауз)
    var begin_count = 4;				//	счетчик для начала упражнения
    var period = 10;					// 	Скорость, выраженная периодом

    var x_monitor;						//	Положение монитора слайдера
    var monitor_margin = 25;			//

    // Константы и настройки
    var amount_of_points = 96;			//  Количество движений в упражнении
    var default_mode = "#mode32";
    var count_mult = parseInt(default_mode.replace("#mode", ""));	//	Количество движений в подходе по умолчанию
    var rest_amount = 3;				//	Время отдыха
    var accuracy = 50;					//	Интервал кванта времени
    var speed_of_resetting = 7;			//	Во время ресета убираются классы. Этот параметр задаёт скорость анимации
    var max_speed = 50;


    time_holder = setInterval(tick, accuracy);
    makeCircle();

    $("#speed").slider({
        animate: "fast",
        max: max_speed - 1,
        min: 0,
        value: max_speed - period,
        create: function (event, ui) {
            slider_monitoring()
        },
        slide: function (event, ui) {
            period = Math.floor(max_speed - $("#speed").slider("option", "value"));
            slider_monitoring();
            i = 0;
            dt = 0;
        },
        change: function (event, ui) {
            period = Math.floor(max_speed - $("#speed").slider("option", "value"));
            slider_monitoring();
            i = 0;
            dt = 0;
        }
    });
    //	Положение и значение монитора скорости
    function slider_monitoring() {
        // Коордлинаты монитора скорости.
        x_monitor = $("#main").offset().left + $("#speed").slider("option", "value") * ( $("#main").width() / (max_speed - 1)) - 20;

        // Столкновение с минусом. Число в конце - щель между кнопкой и монитором
        if (x_monitor < ($("#minus").offset().left + $("#minus").width() + 5)) {
            x_monitor = $("#minus").offset().left + $("#minus").width() + 5;
        }

        // Столкновение с плюсом. Число в конце - щель между кнопкой и монитором
        if (x_monitor > ($("#main").offset().left + $("#main").width() - $("#plus").width() - $("#speed_monitor").width() - 5 )) {
            x_monitor = $("#main").offset().left + $("#main").width() - $("#plus").width() - $("#speed_monitor").width() - 5;
        }
        y = $("#main").offset().top + $('#main').height() + parseInt($("#speed").css('margin-top')) + monitor_margin;
        $("#speed_monitor").offset({left: x_monitor, top: y});
        $('#speed_monitor').html(Math.floor(60000 / (period * 50)));
    }


    // Поместить таймер внутрь круга
    x = $("#main").offset().left + $("#main").width() / 2 - $('#time').width() / 2;
    y = $("#main").offset().top + $("#main").height() / 2 - $('#time').height()/2 -2 ;

    $("#time").offset({left: x, top: y});

    // Поместить статусбар
    x = $("#main").offset().left;
    y = $("#main").offset().top + $('#main').height() + parseInt($("#status_bar").css('margin-top'));
    $("#status_bar").css("width", $('#main').width());
    $("#status_bar").offset({left: x, top: y});

    // Поместить слайдер под круг
    x = $("#main").offset().left;
    y = $("#main").offset().top + $('#main').height() + parseInt($("#speed").css('margin-top'));
    $("#speed").offset({left: x, top: y});
    $("#speed").css("width", $('#main').width());

    /*	// Поместить монитор скорости под круг
     x = $("#main").offset().left + $("#speed" ).slider( "option", "value" )*( $("#main").width()/max_speed) - 10;
     y = $("#main").offset().top + $('#main').height() + parseInt($("#speed").css('margin-top'))+monitor_margin;
     $("#speed_monitor").offset({left:x, top:y });*/

    // Поместить минус
    x = $("#main").offset().left;
    y = $("#main").offset().top + $('#main').height() + parseInt($("#speed").css('margin-top')) + monitor_margin;
    $("#minus").offset({left: x, top: y});

    // Поместить плюс
    x = $("#main").offset().left + $("#main").width() - $("#plus").width();
    y = $("#main").offset().top + $('#main').height() + parseInt($("#speed").css('margin-top')) + monitor_margin;
    $("#plus").offset({left: x, top: y});

    // Поместить START
    x = $("#main").offset().left + $("#main").width() / 2 - $("#start").width() / 2;
    y = $("#main").offset().top - $('#start').height() - 25;
    $("#start").offset({left: x, top: y});

    // Поместить RESET
    x = $("#main").offset().left + $("#main").width() / 2 - $("#reset").width() / 2;
    y = $("#time").offset().top + $('#time').height() / 2 + 60;
    $("#reset").offset({left: x, top: y});

    // Панель управления режимами
    x = $("#main").offset().left - $(".mode").width() - 10;
    y = $("#main").offset().top + $('#main').height() / 2 - $('#mode_control').height() / 2;
    $("#mode_control").offset({left: x, top: y});
    $(default_mode).addClass("button_focus");

    // Поместит Footer
    x = $("#main").offset().left;
    $(".footer").css('width', $("#main").css('width'));
    y = $("#minus").offset().top + $('#minus').height() + $('.footer').height() + parseInt($(".footer").css('margin-top'));
    $(".footer").offset({left: x, top: y});

    //	Автомат --------------------------------------------------------------------------------------------------------
    //	Контроллер автомата
    function tick() {
        dt++;

        if (dt >= period) {
            dt = 0;
            switch (status) {
                case 'wait':
                    waiting();
                    break;
                case 'begin':
                    beginning();
                    break;
                case 'count':
                    counting();
                    break;
                case 'rest':
                    resting();
                    break;
                case 'reset':
                    resetting();
                    break;
            }
        }
    }

    function waiting() {
        // Простой перед запуском
        $('#time').html('00:00');
        $('#status_bar').html('Нажмите START для начала');

    }

    function beginning() {
        // Первый отсчет
        begin_count--;

        $('#time').html(begin_count);
        $('#status_bar').html('Приготовьтесь');
        if (begin_count == 0) {
            poop();
            begin_count = 4;
            status = 'count';
        } else {
            peep()
        }

    }

    function counting() {
        // Отсчет подхода
        count++;
        сhick();
        $('#time').html(convert(count, count_mult));
        $('#start').html('Пауза');
        $('#status_bar').html('');
        num = count + 1;
        $("#round" + num).addClass('round_focus');
        if ((count % count_mult) == 0) {
            peep();
            status = 'rest';
        }
        if (count == amount_of_points) {
            status = 'reset';
            poop();
            count = 0;
        }
    }

    function resting() {
        // Перерыв между упражнениями
        rest_count++;
        //$('#time').html(rest_count);
        $('#status_bar').html('Отдыхаем несколько секунд');
        var real_rest = Math.floor((rest_amount * 1000) / (period * accuracy)); //Вычисление количества шагов для отдыха
        if (rest_count == real_rest) {
            status = 'begin';
            rest_count = 0;
        }
    }

    function resetting() {
        // Сбросить все счетчики
        count = 0;
        rest_count = 0;
        begin_count = 4;
        status = 'wait';
        $('#start').html('Старт');
        $('#time').html('00:00');
        reset_circle(1, amount_of_points);
    }

    //	Вспомогательная функция для отображения таймера
    function convert(count, count_mult) {
        var mins = Math.floor(count / count_mult);
        var secs = (count % count_mult);

        if (secs < 10) {
            secs = '0' + secs;
        }

        if (mins < 10) {
            mins = '0' + mins;
        }

        return (mins + ':' + secs)
    }

    // --------------------------------------------------------------------------------------------------------- Автомат


    //	КНОПКИ ---------------------------------------------------------------------------------------------------------
    //	Кнопка паузы
    $(document).on('ready', function () {
        if (status = 'wait') {
            $('#start').html('Старт');
        }
        $('#start').click(function () {
            if (status == 'wait') {
                status = 'begin';
                $('#start').html('Пауза');
            } else {
                if (status != 'pause') {
                    status_buffer = status;
                    status = 'pause';
                    $('#start').html('Дальше');
                } else {
                    status = status_buffer;
                    $('#start').html('Пауза');
                }
            }
        });
    });

    //	Кнопка сброса
    $(document).on('ready', function () {
        $('#reset').click(function () {
            rotate_button(this.id);
            status = 'reset';

        });
    });

    // Нажатие кнопок 8, 16, 32 и т.д
    var last = $(default_mode);
    $(document).on('ready', function () {
        $('.mode').click(function () {
            $(last).removeClass('button_focus');
            $(event.target).addClass('button_focus');
            last = $(event.target);
            status = 'reset';
            count_mult = parseInt($(this).html());
            makeCircle();
            clearInterval(time_holder);
            time_holder = setInterval(tick, 50);

        });
    });

    // Изменение скорости кнопками <, >
    $(document).on('ready', function () {
        $('#plus').click(function () {
            if (period > 1) {
                i = 0;
                dt = 0;
                period--;
                $("#speed").slider('value', (max_speed - period));
            }
        });
    });

    $(document).on('ready', function () {
        $('#minus').click(function () {
            if (period < max_speed) {
                i = 0;
                dt = 0;
                period++;
                $("#speed").slider('value', (max_speed - period));
            }
        });
    });
    //	Установление счетчика нажатием на точку
    $(document).on('click', function () {
        $('.round,.round_focus,.round_mult').click(function () {
            var id = event.target.id;
            //alert(event.target.id);
            var num_id = id.replace("round", "");
            count = num_id - 2;
            set_circle(1, num_id);
            reset_circle(count, amount_of_points);
            status = "count";
        });
    });

    //	--------------------------------------------------------------------------------------------------------- КНОПКИ


    // -----------------------------------------------------------------------------------------------------------------
    // Функция выстравиает точки, фактически, генерирует основную часть тсраницы
    function makeCircle() {

        $('#main').html('');
        var num = 0;
        for (var counter = 1; counter < amount_of_points + 1; counter++) {
            if (num == 0) {
                round_class = "round_mult";
            } else {
                round_class = "round";
            }
            $('#main').append('<div class="' + round_class + '" id="round' + counter + '"></div>');

            num += 1;
            if (num == count_mult) {
                num = 0;
            }
        }
        var phi = -90;
        var x = 0;
        var y = 0;
        var w = $("#main").width();
        var h = $("#main").height();

        for (var count = 1; count < amount_of_points + 1; count++) {
            if (w <= h) {
                radius = w / 2;
            } else {
                radius = h / 2;
            }

            // Координаты точки
            x = Math.cos(phi * Math.PI / 180) * radius;
            y = Math.sin(phi * Math.PI / 180) * radius;

            // Смещение
            x += $("#main").offset().left + w / 2;
            y += $("#main").offset().top + h / 2;

            // Поправка на размер точки
            x -= $("#round" + count).width() / 2;
            y -= $("#round" + count).width() / 2;
            $("#round" + count).offset({left: x, top: y});
            $("#round" + count).css({"position": "absolute"});
            phi += 360 / amount_of_points;
        }
    }

    //	Эффектно обнуляет счетчик. Анимация обнуления точек таймера
    function reset_circle(id1, id2) {
        var num = id1;
        var resetting = setInterval(deleteClass, speed_of_resetting);

        function deleteClass() {
            num++;
            $("#round" + num).removeClass('round_focus');
            if (num == id2) {
                clearInterval(resetting)
            }
        }

    }
    var rotate_angle = 360;
    var rotate_str;
    var multiplier = 1;
    function rotate_button(id){
        id = '#' + id
        var rotating = setInterval(rot, 50);
        function rot(){

            multiplier *=3;
            if (multiplier > 92){
                multiplier = 50;
            }
            rotate_angle -=multiplier;

            if (rotate_angle < 0) {
                rotate_angle = 360;
                multiplier = 1;
                rotate_str = 'rotate(' + rotate_angle + 'deg)';
                $(id).css({'transform': rotate_str});
                clearInterval(rotating);
            }
            rotate_str = 'rotate(' + rotate_angle + 'deg)';
            $(id).css({'transform': rotate_str});
        }
    }
    function set_circle(id1, id2) {
        var num = id1;
        var resetting = setInterval(addClassFocus, speed_of_resetting);

        function addClassFocus() {
            num++;
            $("#round" + num).addClass('round_focus');

            if (num == id2) {
                clearInterval(resetting)
            }
        }
    }


    //	Аудио проигрыватели --------------------------------------------------------------------------------------------

    var chick_i = 0;

    function сhick() {
        chick_i++;
        document.getElementById('chick' + chick_i).play();
        if (chick_i == 3) {
            chick_i = 0;
        }
    }

    var chock_i = 0;

    function сhock() {
        chock_i++;
        document.getElementById('сhock' + chock_i).play();
        if (chock_i == 3) {
            chock_i = 0;
        }
    }

    var peep_i = 0;

    function peep() {
        peep_i++;
        document.getElementById('peep' + peep_i).play();
        if (peep_i == 3) {
            peep_i = 0;
        }
    }

    var poop_i = 0;

    function poop() {
        poop_i++;
        document.getElementById('poop' + poop_i).play();
        if (poop_i == 3) {
            poop_i = 0;
        }
    }

    //	-------------------------------------------------------------------------------------------- Аудио проигрыватели
});