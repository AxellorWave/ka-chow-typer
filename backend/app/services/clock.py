from datetime import datetime, time, timedelta, timezone

MSK = timezone(timedelta(hours=3))


def msk_now():
    return datetime.now(MSK)


def msk_today():
    return msk_now().date()


def msk_day_end(day):
    return datetime.combine(day + timedelta(days=1), time.min, tzinfo=MSK)
