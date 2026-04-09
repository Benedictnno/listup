"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsModalProps {
  trigger?: React.ReactNode;
}

export default function TermsModal({ trigger }: TermsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-lime-600 hover:text-lime-700 font-semibold underline">
            Terms and Conditions
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white">
        <DialogHeader className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
          <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center text-slate-900 text-xs font-black">
              LU
            </div>
            ListUp Terms and Conditions
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 text-slate-600 leading-relaxed custom-scrollbar">
          <div className="space-y-8">
            <section>
              <p className="font-bold text-slate-900 mb-2">Effective Date: April 9, 2026</p>
              <p className="font-bold text-slate-900">Last Updated: April 9, 2026</p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">1</span>
                Acceptance of Terms
              </h3>
              <p>
                By accessing or using ListUp ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Platform. ListUp is operated by ListUp Inc. and is accessible at listup.ng.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">2</span>
                Eligibility
              </h3>
              <p>
                You must be at least 18 years of age to use ListUp. By registering, you confirm that the information you provide is accurate and complete. ListUp reserves the right to suspend or terminate accounts where false information is detected.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">3</span>
                Account Types
              </h3>
              <ul className="space-y-3 list-none">
                <li className="pl-4 border-l-2 border-lime-400">
                  <span className="font-bold text-slate-900">User Accounts</span> are for buyers who wish to browse, save, and inquire about listings.
                </li>
                <li className="pl-4 border-l-2 border-lime-400">
                  <span className="font-bold text-slate-900">Vendor Accounts</span> are for sellers who wish to list products on the Platform. Vendors must complete a Know Your Customer (KYC) verification process, which includes submitting social media profiles and participating in a WhatsApp interview conducted by the ListUp team. A one-time signup fee applies upon approval.
                </li>
                <li className="pl-4 border-l-2 border-lime-400">
                  <span className="font-bold text-slate-900">Partner Accounts</span> are for affiliates participating in the ListUp referral program.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">4</span>
                Vendor Obligations
              </h3>
              <p className="mb-3">Vendors agree to:</p>
              <ul className="space-y-2 list-disc pl-5 marker:text-lime-500">
                <li>Provide accurate product descriptions, pricing, and images</li>
                <li>Only list items they legally own or have the right to sell</li>
                <li>Respond promptly to buyer inquiries through the Platform's messaging system</li>
                <li>Comply with all applicable Nigerian laws, including consumer protection regulations</li>
                <li>Not list counterfeit, stolen, prohibited, or illegal goods</li>
              </ul>
              <p className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-800">
                ListUp reserves the right to remove any listing that violates these obligations without prior notice.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">5</span>
                KYC Verification and Payments
              </h3>
              <p>
                Vendors must complete KYC verification before gaining full access to listing features. The process involves submitting business social media links and undergoing a brief WhatsApp interview. Upon approval, a non-refundable signup fee of ₦5,000 (or ₦3,000 with a valid referral code) is required. Verification is valid for one year, after which an annual renewal fee of ₦5,000 applies.
              </p>
              <p className="mt-2 font-bold text-slate-900">
                All payments are processed securely through Paystack. ListUp does not store payment card details.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">6</span>
                Listing Limits
              </h3>
              <p>
                Unverified vendors are limited to a maximum of three active listings. Additional listing slots may be purchased in packages. Vendors who complete KYC verification gain unlimited listing access for the duration of their active subscription.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">7</span>
                Referral Program
              </h3>
              <p>
                ListUp operates a referral program that rewards users for referring new vendors to the Platform. Referral rewards are credited as pending earnings and paid out monthly, subject to verification. ListUp reserves the right to withhold or reverse rewards where fraudulent activity is detected.
              </p>
              <p className="mt-2">
                Referral codes provide a ₦2,000 discount on the vendor signup fee to the referred vendor. The referring user earns a commission upon the referred vendor's successful payment and activation.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">8</span>
                Prohibited Conduct
              </h3>
              <p className="mb-3">Users must not:</p>
              <ul className="space-y-2 list-disc pl-5 marker:text-red-500">
                <li>Post false, misleading, or deceptive listings</li>
                <li>Harass, threaten, or intimidate other users</li>
                <li>Attempt to circumvent the Platform's payment systems</li>
                <li>Use the Platform to facilitate fraud or scams</li>
                <li>Scrape, copy, or reproduce Platform content without written permission</li>
                <li>Engage in any activity that disrupts or damages the Platform's infrastructure</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">9</span>
                Transactions and Disputes
              </h3>
              <p>
                ListUp is a marketplace platform and is not a party to any transaction between buyers and sellers. All transactions are conducted directly between users. ListUp does not guarantee the quality, safety, or legality of any listed item, or the accuracy of listings.
              </p>
              <p className="mt-2 p-3 bg-lime-50 rounded-lg border border-lime-100 text-sm text-lime-800">
                Buyers are advised to inspect items before completing a purchase, meet sellers in safe public locations, and avoid making advance payments.
              </p>
              <p className="mt-2">
                In the event of a dispute, ListUp may, at its discretion, assist in facilitating communication between parties but is not obligated to do so and bears no liability for the outcome of any transaction.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">10</span>
                Advertising
              </h3>
              <p>
                ListUp may display advertisements on the Platform. Advertisers pay ListUp directly; no advertiser may pay to have the Platform recommend their products within user conversations. ListUp products are presented free from advertiser influence in their core experience.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">11</span>
                Intellectual Property
              </h3>
              <p>
                All content on ListUp, including logos, design elements, software, and written materials, is the property of ListUp Inc. or its licensors. Users may not reproduce, distribute, or create derivative works from Platform content without express written permission.
              </p>
              <p className="mt-2">
                By posting content on ListUp, you grant ListUp a non-exclusive, royalty-free license to display, reproduce, and distribute that content solely for the purpose of operating the Platform.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">12</span>
                Privacy
              </h3>
              <p>
                Your use of ListUp is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection and use of your information as described therein.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">13</span>
                WhatsApp Communications
              </h3>
              <p>
                By providing your phone number and opting in during registration, you consent to receiving WhatsApp messages from ListUp, including order updates, listing inquiries, and promotional content. You may opt out at any time by replying "STOP" to any message. Opting out will not affect your ability to use the Platform.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">14</span>
                Disclaimer of Warranties
              </h3>
              <p>
                ListUp is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. ListUp does not warrant that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">15</span>
                Limitation of Liability
              </h3>
              <p>
                To the fullest extent permitted by applicable law, ListUp Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to losses arising from transactions conducted between users.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">16</span>
                Termination
              </h3>
              <p>
                ListUp reserves the right to suspend or permanently terminate any account at its sole discretion, with or without notice, for violation of these Terms or conduct deemed harmful to the Platform or its users. Upon termination, your right to access the Platform ceases immediately.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">17</span>
                Governing Law
              </h3>
              <p>
                These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising under these Terms shall be subject to the jurisdiction of Nigerian courts.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">18</span>
                Changes to These Terms
              </h3>
              <p>
                ListUp may update these Terms from time to time. Continued use of the Platform after any update constitutes your acceptance of the revised Terms. Material changes will be communicated via email or a prominent notice on the Platform.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">19</span>
                Contact
              </h3>
              <p>
                For questions about these Terms, please contact us via WhatsApp at <span className="font-bold text-slate-900">+234 901 102 2509</span> or through the support section on listup.ng.
              </p>
            </section>
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end sticky bottom-0 z-10">
          <button 
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
          >
            I Understand
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
