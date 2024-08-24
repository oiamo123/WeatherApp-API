const schedule = require("node-schedule");
const User = require("../Models/User.js");
const { date } = require("zod");
const { sendText } = require("./Text.js")
const { DateTime } = require("luxon")

const setNotifications = async function (phoneNumber) {
  try {
    const user = await User.findOne({ phoneNumber: phoneNumber });

    if (!user) {
      throw new Error("User not found");
    }


    const calculatedTime = 

    user.notificationDays.forEach(day => {
        if (day.date > date.now()) {
            const rule = new schedule.RecurrenceRule({ hour: calculatedTime, minute: 0, tz: `${}`});
            // Schedule the notification
            schedule.scheduleJob({start: Date.now(), end: day.Date, rule: rule}, () => {
                sendText(user.phoneNumber, ``)
            });
        }
    })
  } catch (err) {

  }
};

// Schedule a notification for a specific date
scheduleNotification(user, '2024-08-23');
