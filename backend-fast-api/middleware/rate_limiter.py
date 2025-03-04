from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

public_api_limiter = limiter.limit("300 per 10 minutes")
auth_api_limiter = limiter.limit("100 per 30 minutes")
auth_limiter = limiter.limit("10 per 10 minutes")