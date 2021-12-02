const { User, Token } = require('../../database/models');

class VerifyEmailController {
    static async verify(req, res) {
        const token = await Token.findOne({
            where: {
                token: req.params.token
            }
        });

        const user = await User.findByPk(req.params.id);

        if (!token) {
            res.status(400).json({ message: 'Token invalid!' });
        }

        if (token) {
            token.destroy();

            user.update({
                isActive: true,
            }).then(() => {
                res.status(200).json({ message: 'Email verified! Your account is now active!' });
            });
        }
    }
}

module.exports = VerifyEmailController;