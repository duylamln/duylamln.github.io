(function (module) {
    module.value("appValues", appValues());

    function appValues() {
        var deliveryDates = [
            new Date(2018, 07, 22),
            new Date(2018, 08, 05),
            new Date(2018, 08, 19),
            new Date(2018, 09, 03),
            new Date(2018, 09, 17),
            new Date(2018, 09, 31),
            new Date(2018, 10, 14),
            new Date(2018, 10, 28),
            new Date(2018, 11, 12),
            new Date(2018, 11, 26),
            new Date(2019, 0, 09),
            new Date(2019, 0, 23),
            new Date(2019, 1, 07),
            new Date(2019, 1, 21),
            new Date(2019, 2, 06),
            new Date(2019, 2, 20),
            new Date(2019, 3, 03),
            new Date(2019, 3, 17),
            new Date(2019, 4, 01),
            new Date(2019, 4, 15),
            new Date(2019, 4, 29),
            new Date(2019, 5, 12),
            new Date(2019, 5, 26),
            new Date(2019, 6, 10),
            new Date(2019, 6, 24),
            new Date(2019, 7, 07),
            new Date(2019, 7, 21),
            new Date(2019, 8, 4),
            new Date(2019, 8, 18),
            new Date(2019, 9, 02),
            new Date(2019, 9, 16),
            new Date(2019, 9, 30)
        ];


        var sprintDefine = buildSprintDates(deliveryDates);

        /*
        Sunday: 0,
        Monday: 1
        ...
        Satuday: 6
         */
        var sprintActivityDefine = [
            {
                day: [1, 2],
                week: 1,
                content: "<span class=''>Work for this sprint</span>"
            },
            {
                day: [3],
                week: 1,
                content:
                    "<span class=''>Work for this sprint</span></br><span class='text-danger'>Deploy Production</span>"
            },
            {
                day: [4, 5],
                week: 1,
                content: "<span class=''>Work for this sprint</span>"
            },
            {
                day: [1, 2],
                week: 2,
                content: "<span class=''>Work for <strong>next sprint</strong></span>"
            },
            {
                day: [3],
                week: 2,
                content:
                    "<span class='text-primary'>Planning for next 2 sprints</span></br>Work for <strong>next sprint</strong>"
            },
            {
                day: [4, 5],
                week: 2,
                content: "<span class='text-danger'>Fix bug for this sprint</span>"
            }
        ];

        return {
            sprintDefine: sprintDefine,
            sprintActivityDefine: sprintActivityDefine,
            deliveryDates: deliveryDates,
            //baseApi: "http://crawler.local/"
            baseApi: "https://crawler-api-239514.appspot.com/"
            // baseApi: "http://localhost:50969/"
        };
    }

    /*
      sprint: {
          title: "20180822",
          date: 2018-08-22,
          from: "2018-08-06",
          to: "2018-08-17",
          endWeek1: "2018-08-10",
          startWeek2: "2018-08-13"
      }
       */
    function buildSprintDates(deliveryDates) {
        return _.map(deliveryDates, function (item) {
            var momentDate = moment(item);
            var start = moment(item)
                .subtract(2, "weeks")
                .startOf("week")
                .add(1, "days"); //Monday
            var endWeek1 = moment(start).add(4, "days");
            var end = moment(item)
                .subtract(1, "weeks")
                .endOf("week")
                .subtract(1, "days"); //Friday
            var startWeek2 = moment(endWeek1).add(3, "days");

            return {
                title: momentDate.format("YYYYMMDD"),
                date: item,
                from: start,
                to: end,
                endWeek1: endWeek1,
                startWeek2: startWeek2
            }
        });
    }
})(angular.module("myApp"))
