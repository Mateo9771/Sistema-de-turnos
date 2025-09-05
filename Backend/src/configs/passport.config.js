    //TURNERO\Backend\src\configs\passport.config.js
    import passport from 'passport';
    import passportLocal from 'passport-local';
    import jwtStrategy from 'passport-jwt';
    import usersModel from '../services/models/users.model.js';
    import {cookieExtractor, PRIVATE_KEY} from '../utils/jwt.js';
    import { createHash } from '../utils/password.js';
    import logger from '../utils/logger.js';

    //estrategia declarada
    const localStrategy = passportLocal.Strategy;
    const JwtStrategy = jwtStrategy.Strategy;
    const ExtractJWT = jwtStrategy.ExtractJwt;

    const initializePassport = () => {

        //JwtStrategy

        passport.use('jwt', new JwtStrategy(
            {
                jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
                secretOrKey: PRIVATE_KEY
            }, async(jwt_payload, done) => {
                logger.info("Entrando a passport Strategy con JWT.");
                try{
                    logger.info("jwt obtenido payload")
                    logger.info(jwt_payload)
                    return done(null, jwt_payload.user)
                }catch(error){
                    logger.error("Error en estrategia de passport jwt")
                    return done(error)
                }
            }
        ))

        //LocalStrategy - registro de usuario
        passport.use('register', new localStrategy(
            {passReqToCallback: true, usernameField: 'email'},
            async(req, username, password, done) => {
                logger.info(`Registrando usuario ${username}`);
                
                const {first_name, last_name, email, age, role} = req.body;

                const isAdmin = req.user && req.user.role === 'admin';
                const userRole = isAdmin ? role || 'admin' : 'user';

                try{
                    const exist = await usersModel.findOne({ email: username });
                    if(exist) {
                        logger.warn("El usuario ya existe")
                        return done(null, false);
                    }
                    const user =  {
                        first_name,
                        last_name,
                        age,
                        password: createHash(password),
                        role: userRole,
                        loggedby: "App"
                    };
                    const result = await usersModel.create(user);

                    return done(null, result)
                } catch(error){
                    return done("Error registrando usuario: " + error)
                }
            }
        ))

        //Serialización y deserialización

        passport.serializeUser((user, done) => {
            done(null, user._id)
        })

        passport.deserializeUser(async(_id, done) =>{
            try{
                let user = await usersModel.findById(_id);
                done (null, user)
            } catch (error) {
                logger.error("Error deserialización el usuario: " +  error);
            }
        })

    }

    export default initializePassport