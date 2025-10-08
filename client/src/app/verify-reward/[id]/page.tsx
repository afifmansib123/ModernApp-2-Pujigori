"use client";

import { useParams } from "next/navigation";
import { useGetDonationQuery } from "@/state/api";
import { CheckCircle, XCircle, Gift, User, Mail, Calendar, Loader2 } from "lucide-react";

export default function VerifyRewardPage() {
  const params = useParams();
  const donationId = params?.id as string;

  const { data: donationData, isLoading, error } = useGetDonationQuery(donationId, {
    skip: !donationId,
  });

  const donation = donationData?.data;

  // Check if expired (30 days from creation)
  const isExpired = donation?.createdAt 
    ? (() => {
        const createdDate = new Date(donation.createdAt);
        const expiryDate = new Date(createdDate);
        expiryDate.setDate(expiryDate.getDate() + 30);
        return expiryDate < new Date();
      })()
    : false;

  const isValid = donation?.paymentStatus === "success" && 
                  donation?.rewardStatus === "pending" && 
                  !isExpired;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying reward...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid QR Code</h1>
          <p className="text-gray-600">
            This reward code could not be found or is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`p-6 text-center ${
            isValid 
              ? "bg-gradient-to-r from-green-500 to-green-600" 
              : donation.rewardStatus === "redeemed"
              ? "bg-gradient-to-r from-blue-500 to-blue-600"
              : "bg-gradient-to-r from-red-500 to-red-600"
          }`}>
            {isValid ? (
              <CheckCircle className="h-16 w-16 text-white mx-auto mb-3" />
            ) : (
              <XCircle className="h-16 w-16 text-white mx-auto mb-3" />
            )}
            <h2 className="text-2xl font-bold text-white mb-1">
              {isValid 
                ? "✓ Valid Reward" 
                : donation.rewardStatus === "redeemed"
                ? "Already Redeemed"
                : isExpired 
                ? "Expired Reward"
                : "Invalid Reward"
              }
            </h2>
            <p className="text-white text-opacity-90 text-sm">
              {isValid 
                ? "Ready to redeem" 
                : donation.rewardStatus === "redeemed"
                ? "This reward has already been claimed"
                : isExpired 
                ? "This reward expired 30 days after donation"
                : "Cannot verify reward"
              }
            </p>
          </div>

          {/* Main Info */}
          <div className="p-8 space-y-6">
            {/* Reward Value - BIG */}
            <div className="text-center pb-6 border-b-2 border-gray-100">
              <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide font-semibold">
                Reward Value
              </p>
              <p className="text-6xl font-bold text-green-600 mb-1">
                ৳{donation.rewardValue?.toLocaleString()}
              </p>
              {donation.rewardTierDetails && (
                <p className="text-sm text-gray-600 mt-2">
                  {donation.rewardTierDetails.title}
                </p>
              )}
            </div>

            {/* Customer Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Customer Name
                  </p>
                  <p className="font-bold text-gray-900 text-lg truncate">
                    {donation.donorDisplayName || donation.donorInfo?.name || "Anonymous"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Email / Contact
                  </p>
                  <p className="font-semibold text-gray-900 text-sm break-all">
                    {donation.donorInfo?.email || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Valid Until
                  </p>
                  <p className="font-semibold text-gray-900">
                    {(() => {
                      const createdDate = new Date(donation.createdAt);
                      const expiryDate = new Date(createdDate);
                      expiryDate.setDate(expiryDate.getDate() + 30);
                      return expiryDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Reward Details */}
            {donation.rewardTierDetails && (
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="h-5 w-5 text-purple-600" />
                  <h3 className="font-bold text-purple-900">
                    What Customer Gets:
                  </h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  {donation.rewardTierDetails.description}
                </p>
                {donation.rewardTierDetails.items && donation.rewardTierDetails.items.length > 0 && (
                  <div className="space-y-2">
                    {donation.rewardTierDetails.items.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span className="text-gray-800 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Donation Info */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-700 font-semibold">
                  Original Donation
                </span>
                <span className="text-xl font-bold text-blue-900">
                  ৳{donation.amount?.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-blue-600">
                Donated on {new Date(donation.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              </div>

            {/* Instructions for Staff */}
            {isValid ? (
              <div className="bg-green-50 rounded-xl p-5 border-2 border-green-300">
                <p className="text-base font-bold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Staff Instructions:
                </p>
                <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                  <li className="font-semibold">Verify customer name or email matches</li>
                  <li className="font-semibold">
                    Provide reward worth <span className="text-green-600">৳{donation.rewardValue?.toLocaleString()}</span>
                  </li>
                  <li className="font-semibold">Mark as redeemed in your system</li>
                  <li className="font-semibold">Thank the customer!</li>
                </ol>
              </div>
            ) : donation.rewardStatus === "redeemed" ? (
              <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200 text-center">
                <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-900 font-semibold">
                  This reward was already redeemed
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Customer has already collected their reward
                </p>
              </div>
            ) : (
              <div className="bg-red-50 rounded-xl p-5 border-2 border-red-200 text-center">
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                <p className="text-red-900 font-semibold">
                  Cannot Redeem Reward
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {isExpired ? "Reward has expired (30 days limit)" : "Reward is not available"}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Donation ID: {donation._id?.toString().slice(-8)}</span>
              <span>Project: {donation.project?.title || "Unknown"}</span>
            </div>
          </div>
        </div>

        {/* Powered by footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Secured by <span className="font-bold text-green-600">PujiGori</span>
          </p>
        </div>
      </div>
    </div>
  );
}