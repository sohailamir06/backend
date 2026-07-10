const Activity = require("../models/Activity");
const { createPublicId } = require("../utils/id");

async function addActivity(companyId, user, action, medicine = "System") {
  const activity = await Activity.create({
    companyId,
    id: createPublicId("activity"),
    action,
    medicine,
    actorId: user?._id,
    timestamp: new Date(),
  });

  const oldActivities = await Activity.find({ companyId }).sort({ timestamp: -1 }).skip(50).select("_id");

  if (oldActivities.length > 0) {
    await Activity.deleteMany({ _id: { $in: oldActivities.map((item) => item._id) } });
  }

  return activity.toClient();
}

async function listActivities(companyId, limit = 50) {
  const activities = await Activity.find({ companyId }).sort({ timestamp: -1 }).limit(limit);
  return activities.map((activity) => activity.toClient());
}

module.exports = {
  addActivity,
  listActivities,
};
