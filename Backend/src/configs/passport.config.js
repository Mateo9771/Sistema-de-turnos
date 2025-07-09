    //TURNERO\Backend\src\configs\passport.config.js
    import passport from 'passport';
    import passportLocal from 'passport-local';
    import jwtStrategy from 'passport-jwt';
    import usersModel from '../services/models/users.model.js';
    import {cookieExtractor, PRIVATE_KEY} from '../utils/jwt.js';
    import { createHash } from '../utils/password.js';

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
                console.log("Entrando a passport Strategy con JWT.");
                try{
                    console.log("jwt obtenido payload")
                    console.log(jwt_payload)
                    return done(null, jwt_payload.user)
                }catch(error){
                    console.error(error);
                    return done(error)
                }
            }
        ))

        //LocalStrategy - registro de usuario
        passport.use('register', new localStrategy(
            {passReqToCallback: true, usernameField: 'email'},
            async(req, username, password, done) => {
                console.log('userModel', username);
                
                const {first_name, last_name, email, age, role} = req.body;

                const isAdmin = req.user && req.user.role === 'admin';
                const userRole = isAdmin ? role || 'admin' : 'user';

                try{
                    const exist = await usersModel.findOne({ email: username });
                    if(exist) {
                        console.log("El usuario ya existe")
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
                console.error("Error deserialización el usuario: " +  error);
            }
        })

    }

    export default initializePassport