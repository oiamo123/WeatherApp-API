const schedule = require("node-schedule");
const User = require("../Models/User.js");
const { zod } = require("zod");
const { sendText } = require("./Text.js");
const { DateTime } = require("luxon");

const setNotifications = async function (phoneNumber) {
  try {
    // grab user
    const user = await User.findOne({ phoneNumber: phoneNumber });

    if (!user) {
      throw new Error("User not found");
    }

    // for each desired user notification, schedule a notification
    user.notificationDays.forEach((day) => {
      const now = DateTime.local(); // Current time in the server's timezone
      const notificationDate = DateTime.fromISO(day.date)
        .setZone(user.timezone) // Convert to user’s timezone
        .set({
          hour: user.notificationTime.split(":")[0],
          minute: user.notificationTime.split(":")[1],
        }); // Set time

      // If notification date is in the future, schedule it
      if (notificationDate > now) {
        const rule = new schedule.RecurrenceRule();
        rule.hour = notificationDate.hour;
        rule.minute = notificationDate.minute;
        rule.tz = user.timezone; // Set the timezone

        // Schedule the job with start and end times
        schedule.scheduleJob(
          { start: now.toJSDate(), end: notificationDate.toJSDate() },
          rule,
          () => {
            sendText(user.phoneNumber, `Reminder: Your notification!`);
          }
        );
      } else {
        // Remove past notifications
        user.notificationDays = user.notificationDays.filter(
          (day) => DateTime.fromISO(day.date).setZone(user.timezone) > now
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = setNotifications;
