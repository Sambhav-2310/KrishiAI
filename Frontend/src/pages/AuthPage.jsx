import { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import {
  citiesFor,
  countryName,
  countries,
  stateName,
  statesFor
} from '../data/locations'

export default function AuthPage({ register = false }) {

  const {
    login,
    register: signup,
    verifyOtp,
    resendOtp
  } = useContext(AuthContext)

  const go = useNavigate()
  const location = useLocation()

  const from = location.state?.from
  const promptMessage = location.state?.message

  const [data, setData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    password: '',
    confirm: '',
    role: 'CONSUMER'
  })

  const [otp, setOtp] = useState('')
  const [otpStep, setOtpStep] = useState(false)

  // Resend OTP states
  const [resendTimer, setResendTimer] = useState(60)
  const [resendingOtp, setResendingOtp] = useState(false)

  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)


  // =========================
  // OTP COUNTDOWN TIMER
  // =========================

  useEffect(() => {

    if (!otpStep) {
      return
    }

    if (resendTimer <= 0) {
      return
    }

    const timer = setInterval(() => {
      setResendTimer(current => current - 1)
    }, 1000)

    return () => clearInterval(timer)

  }, [otpStep, resendTimer])


  // =========================
  // FORM CHANGE
  // =========================

  const change = e => {

    setData({
      ...data,
      [e.target.name]: e.target.value
    })

  }


  // =========================
  // COUNTRY CHANGE
  // =========================

  const changeCountry = e => {

    setData({
      ...data,
      country: e.target.value,
      state: '',
      city: ''
    })

  }


  // =========================
  // STATE CHANGE
  // =========================

  const changeState = e => {

    setData({
      ...data,
      state: e.target.value,
      city: ''
    })

  }


  // =========================
  // LOGIN / REGISTER
  // =========================

  const submit = async e => {

    e.preventDefault()

    setErr('')
    setSuccess('')


    // Password confirmation
    if (register && data.password !== data.confirm) {

      setErr('Passwords do not match.')

      return
    }


    // Password length
    if (data.password.length < 6) {

      setErr('Password must be at least 6 characters.')

      return
    }


    setBusy(true)


    try {

      // =========================
      // REGISTER
      // =========================

      if (register) {

        const registrationData = {

          name: data.name.trim(),

          email: data.email.trim(),

          phone: data.phone.trim(),

          password: data.password,

          country: data.country || 'IN',

          state: data.state || '',

          city: data.city || '',

          location:
              [
                data.city,
                stateName(data.country, data.state),
                countryName(data.country)
              ]
                  .filter(Boolean)
                  .join(', ') || 'India',

          role: data.role || 'CONSUMER'

        }


        await signup(registrationData)


        // Open OTP screen
        setOtpStep(true)

        // Start resend countdown
        setResendTimer(60)

        // Clear OTP input
        setOtp('')

        setSuccess(
            `Registration successful. An OTP has been sent to ${data.email.trim()}.`
        )

        return
      }


      // =========================
      // LOGIN
      // =========================

      const user = await login({
        email: data.email.trim(),
        password: data.password
      })


      // =========================
      // ROLE-BASED REDIRECT
      // =========================

      let destination


      if (user.role === 'ADMIN') {

        destination = '/admin/dashboard'

      } else if (user.role === 'FARMER') {

        destination = '/farmer/dashboard'

      } else {

        destination = '/consumer/dashboard'

      }


      // =========================
      // NAVIGATE AFTER LOGIN
      // =========================

      go(destination, {
        replace: true
      })


    } catch (error) {

      console.error('Authentication error:', error)


      const message =
          error?.response?.data?.message ||
          error?.response?.data ||
          'Unable to complete this request right now. Please try again.'


      setErr(
          typeof message === 'string'
              ? message
              : 'Unable to complete this request right now. Please try again.'
      )

    } finally {

      setBusy(false)

    }

  }


  // =========================
  // VERIFY OTP
  // =========================

  const submitOtp = async e => {

    e.preventDefault()

    setErr('')
    setSuccess('')


    if (!otp.trim()) {

      setErr('Please enter the OTP.')

      return
    }


    if (!/^\d{6}$/.test(otp.trim())) {

      setErr('Please enter a valid 6-digit OTP.')

      return
    }


    setBusy(true)


    try {

      await verifyOtp({
        email: data.email.trim(),
        otp: otp.trim()
      })


      setSuccess(
          'Email verified successfully. Your account is ready. Redirecting to login...'
      )


      setTimeout(() => {

        go('/login', {
          replace: true,
          state: {
            message: 'Account verified successfully. Please login.'
          }
        })

      }, 1200)


    } catch (error) {

      console.error('OTP verification error:', error)


      const message =
          error?.response?.data?.message ||
          error?.response?.data ||
          'Invalid or expired OTP.'


      setErr(
          typeof message === 'string'
              ? message
              : 'Invalid or expired OTP.'
      )

    } finally {

      setBusy(false)

    }

  }


  // =========================
  // RESEND OTP
  // =========================

  const handleResendOtp = async () => {

    // Do not allow resend while countdown is active
    if (resendTimer > 0) {
      return
    }


    // Do not allow multiple requests
    if (resendingOtp) {
      return
    }


    try {

      setResendingOtp(true)

      setErr('')

      setSuccess('')


      await resendOtp(data.email.trim())


      // Clear previous OTP
      setOtp('')


      // Restart 60-second countdown
      setResendTimer(60)


      setSuccess(
          `A new OTP has been sent to ${data.email.trim()}.`
      )


    } catch (error) {

      console.error('Failed to resend OTP:', error)


      const message =
          error?.response?.data?.message ||
          error?.response?.data ||
          'Unable to resend OTP.'


      setErr(
          typeof message === 'string'
              ? message
              : 'Unable to resend OTP.'
      )

    } finally {

      setResendingOtp(false)

    }

  }


  // =========================
  // BACK TO REGISTRATION
  // =========================

  const backToRegistration = () => {

    setOtpStep(false)

    setOtp('')

    setErr('')

    setSuccess('')

    setResendTimer(60)

    setResendingOtp(false)

  }


  // =========================
  // UI
  // =========================

  return (

      <section className="container py-5">

        <div className="row justify-content-center">

          <div className="col-md-8 col-lg-6">

            <div className="card p-4 p-md-5">


              {/* =========================
                PAGE HEADER
            ========================= */}

              <p className="section-label">

                {register
                    ? otpStep
                        ? 'Verify your email'
                        : 'Create your account'
                    : 'Welcome back'
                }

              </p>


              <h1 className="h2">

                {register
                    ? otpStep
                        ? 'Enter OTP'
                        : 'Join KrishiAI'
                    : 'Login to KrishiAI'
                }

              </h1>



              {/* =========================
                PROMPT MESSAGE
            ========================= */}

              {promptMessage && (

                  <div className="alert alert-info d-flex align-items-center mb-3">

                    <i className="bi bi-info-circle-fill me-2" />

                    <span>{promptMessage}</span>

                  </div>

              )}



              {/* =========================
                ERROR MESSAGE
            ========================= */}

              {err && (

                  <div className="alert alert-danger">

                    {err}

                  </div>

              )}



              {/* =========================
                SUCCESS MESSAGE
            ========================= */}

              {success && (

                  <div className="alert alert-success">

                    {success}

                  </div>

              )}



              {/* =========================
                OTP STEP
            ========================= */}

              {register && otpStep ? (

                  <form
                      onSubmit={submitOtp}
                      className="row g-3"
                  >


                    {/* EMAIL */}

                    <div className="col-12">

                      <p className="text-muted mb-1">

                        We sent a verification code to:

                      </p>

                      <strong>{data.email}</strong>

                    </div>



                    {/* OTP INPUT */}

                    <div className="col-12">

                      <label className="form-label">

                        Verification OTP

                      </label>


                      <input

                          required

                          type="text"

                          inputMode="numeric"

                          maxLength="6"

                          value={otp}

                          onChange={e => {

                            const value = e.target.value
                                .replace(/\D/g, '')
                                .slice(0, 6)

                            setOtp(value)

                          }}

                          className="form-control text-center"

                          placeholder="Enter 6-digit OTP"

                          autoComplete="one-time-code"

                      />

                    </div>



                    {/* VERIFY BUTTON */}

                    <div className="col-12">

                      <button

                          type="submit"

                          disabled={busy || resendingOtp}

                          className="btn btn-success w-100"

                      >

                        {busy
                            ? 'Verifying…'
                            : 'Verify email'
                        }

                      </button>

                    </div>



                    {/* RESEND OTP */}

                    <div className="col-12 text-center">

                      {resendTimer > 0 ? (

                          <p className="text-muted small mb-0">

                            You can resend OTP in{' '}

                            <strong>

                              {resendTimer}

                            </strong>{' '}

                            seconds

                          </p>

                      ) : (

                          <button

                              type="button"

                              className="btn btn-link text-success p-0"

                              onClick={handleResendOtp}

                              disabled={resendingOtp}

                          >

                            {resendingOtp
                                ? 'Sending OTP…'
                                : 'Resend OTP'
                            }

                          </button>

                      )}

                    </div>



                    {/* BACK */}

                    <div className="col-12 text-center">

                      <button

                          type="button"

                          className="btn btn-link text-success"

                          onClick={backToRegistration}

                          disabled={busy || resendingOtp}

                      >

                        Back to registration

                      </button>

                    </div>


                  </form>

              ) : (


                  /* =========================
                     LOGIN / REGISTRATION FORM
                  ========================= */

                  <form
                      onSubmit={submit}
                      className="row g-3"
                  >


                    {/* =========================
                    REGISTRATION FIELDS
                ========================= */}

                    {register && (

                        <>


                          {/* NAME */}

                          <div className="col-12">

                            <label className="form-label">

                              Full name

                            </label>


                            <input

                                required

                                name="name"

                                value={data.name}

                                className="form-control"

                                onChange={change}

                                placeholder="e.g. Ramesh Patil"

                            />

                          </div>



                          {/* PHONE */}

                          <div className="col-12">

                            <label className="form-label">

                              Phone number

                            </label>


                            <input

                                required

                                type="tel"

                                name="phone"

                                value={data.phone}

                                className="form-control"

                                onChange={change}

                                placeholder="+91 98765 43210"

                            />

                          </div>



                          {/* COUNTRY */}

                          <div className="col-md-4">

                            <label className="form-label">

                              Country

                            </label>


                            <select

                                required

                                className="form-select"

                                value={data.country}

                                onChange={changeCountry}

                            >

                              <option value="">

                                Select country

                              </option>


                              {countries.map(country => (

                                  <option

                                      key={country.isoCode}

                                      value={country.isoCode}

                                  >

                                    {country.name}

                                  </option>

                              ))}

                            </select>

                          </div>



                          {/* STATE */}

                          <div className="col-md-4">

                            <label className="form-label">

                              State

                            </label>


                            <select

                                required

                                className="form-select"

                                value={data.state}

                                onChange={changeState}

                                disabled={!data.country}

                            >

                              <option value="">

                                Select state

                              </option>


                              {statesFor(data.country).map(state => (

                                  <option

                                      key={state.isoCode}

                                      value={state.isoCode}

                                  >

                                    {state.name}

                                  </option>

                              ))}

                            </select>

                          </div>



                          {/* CITY */}

                          <div className="col-md-4">

                            <label className="form-label">

                              City

                            </label>


                            <select

                                required

                                className="form-select"

                                name="city"

                                value={data.city}

                                onChange={change}

                                disabled={!data.state}

                            >

                              <option value="">

                                Select city

                              </option>


                              {citiesFor(
                                  data.country,
                                  data.state
                              ).map(city => (

                                  <option

                                      key={`${city.name}-${city.latitude}-${city.longitude}`}

                                      value={city.name}

                                  >

                                    {city.name}

                                  </option>

                              ))}

                            </select>

                          </div>


                        </>

                    )}



                    {/* =========================
                    EMAIL
                ========================= */}

                    <div className="col-12">

                      <label className="form-label">

                        Email

                      </label>


                      <input

                          required

                          type="email"

                          name="email"

                          value={data.email}

                          className="form-control"

                          onChange={change}

                          placeholder="name@example.com"

                          autoComplete="email"

                      />

                    </div>



                    {/* =========================
                    PASSWORD
                ========================= */}

                    <div className="col-12">

                      <label className="form-label">

                        Password

                      </label>


                      <input

                          required

                          minLength="6"

                          type="password"

                          name="password"

                          value={data.password}

                          className="form-control"

                          onChange={change}

                          placeholder="At least 6 characters"

                          autoComplete={
                            register
                                ? 'new-password'
                                : 'current-password'
                          }

                      />

                    </div>



                    {/* =========================
                    CONFIRM PASSWORD
                ========================= */}

                    {register && (

                        <>


                          <div className="col-12">

                            <label className="form-label">

                              Confirm password

                            </label>


                            <input

                                required

                                type="password"

                                name="confirm"

                                value={data.confirm}

                                className="form-control"

                                onChange={change}

                                placeholder="Re-enter password"

                                autoComplete="new-password"

                            />

                          </div>



                          {/* ROLE */}

                          <div className="col-12">

                            <label className="form-label">

                              I am joining as

                            </label>


                            <select

                                className="form-select"

                                name="role"

                                value={data.role}

                                onChange={change}

                            >

                              <option value="CONSUMER">

                                Consumer (Buy produce, direct orders)

                              </option>


                              <option value="FARMER">

                                Farmer (Sell produce, AI crop tools)

                              </option>

                            </select>

                          </div>


                        </>

                    )}



                    {/* =========================
                    REMEMBER ME
                ========================= */}

                    {!register && (

                        <div className="col-12 form-check">

                          <input

                              className="form-check-input"

                              id="remember"

                              type="checkbox"

                          />


                          <label

                              className="form-check-label"

                              htmlFor="remember"

                          >

                            Remember me

                          </label>

                        </div>

                    )}



                    {/* =========================
                    SUBMIT
                ========================= */}

                    <div className="col-12">

                      <button

                          disabled={busy}

                          className="btn btn-success w-100"

                      >

                        {busy

                            ? 'Please wait…'

                            : register
                                ? 'Create account'
                                : 'Login'

                        }

                      </button>

                    </div>


                  </form>

              )}



              {/* =========================
                LOGIN / REGISTER LINK
            ========================= */}

              {!otpStep && (

                  <p className="text-center text-muted mt-3 mb-0">

                    {register
                        ? 'Already have an account?'
                        : 'New to KrishiAI?'
                    }{' '}


                    <Link

                        className="text-success"

                        to={register ? '/login' : '/register'}

                        state={location.state}

                    >

                      {register
                          ? 'Login'
                          : 'Register'
                      }

                    </Link>

                  </p>

              )}


            </div>

          </div>

        </div>

      </section>

  )
}