import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import "./getInTouchStyles.css";

const GetInTouch = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.subject || !form.message) {
      setStatus('error');
      setTimeout(() => setStatus(null), 4000);
      return;
    }

    setSubmitting(true);
    try {
      const CONTACT_URL = process.env.REACT_APP_CONTACT_FORM_URL;
      if (CONTACT_URL) {
        const res = await fetch(CONTACT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            subject: form.subject,
            message: form.message,
            to: 'info@ieeeaastcairo.org',
            timestamp: new Date().toISOString(),
          }),
        });
        // no-cors returns opaque; treat as success
        if (res.type === 'opaque' || res.ok) {
          setStatus('success');
          setForm({ firstName: '', lastName: '', email: '', subject: '', message: '' });
          setTimeout(() => setStatus(null), 5000);
        } else {
          setStatus('error');
          setTimeout(() => setStatus(null), 5000);
        }
      } else {
        // Fallback: open mail client if backend URL not configured
        const mailto = `mailto:info@ieeeaastcairo.org?subject=${encodeURIComponent(
          form.subject
        )}&body=${encodeURIComponent(`From: ${form.firstName} ${form.lastName} <${form.email}>\n+
${form.message}`)}`;
        window.location.href = mailto;
      }
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="get-in-touch">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-bold">Get in Touch</h2>
              <p className="text-xl text-blue-100">
                Ready to join our community? Have questions about our programs? We'd love to hear from you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <EmailIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-blue-100">info@ieeeaastcairo.org</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <PhoneIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">Phone</div>
                  <div className="text-blue-100">+20 101 8678731</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <LocationOnIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">Location</div>
                  <div className="text-blue-100">AAST Campus, Cairo, Egypt</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="form-card">
              <div className="form-header">
                <h3 className="form-title">Send us a message</h3>
                <p className="form-description">We'll get back to you within 24 hours</p>
              </div>
              <form className="contact-form-content" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ali"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Osama"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="aliosama@example.com"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input full-width"
                    placeholder="How can we help you?"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">Message</label>
                  <textarea
                    rows={4}
                    className="form-textarea full-width"
                    placeholder="Tell us more about your inquiry..."
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                  />
                </div>
                <button type="submit" className="submit-button" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send Message'}
                  <ArrowForwardIcon className="button-icon" />
                </button>

                {status === 'success' && (
                  <div className="submit-status success" style={{ marginTop: '12px' }}>
                    Message sent successfully.
                  </div>
                )}
                {status === 'error' && (
                  <div className="submit-status error" style={{ marginTop: '12px' }}>
                    Please fill all fields or try again later.
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GetInTouch; 
