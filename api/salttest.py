from werkzeug.security import generate_password_hash, check_password_hash

class User(object):

    def __init__(self, username, password):
        self.username = username
        self.set_password(password)

    def set_password(self, password):
        self.pw_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.pw_hash, password)

'''
>>> me = User('John Doe', 'default')
>>> me.pw_hash
'sha1$Z9wtkQam$7e6e814998ab3de2b63401a58063c79d92865d79'
>>> me.check_password('default')
True
>>> me.check_password('defaultx')
False
'''