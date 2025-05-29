import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Import your user models (adjust paths as needed)
import Student from "../models/student.model.js";
import Counselor from "../models/counselor.model.js";
import School from "../models/school.model.js";

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.get("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Check if token starts with Bearer
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request object
    req.user = {
      id: decoded.id || decoded.userId,
      role: decoded.role,
      schoolId: decoded.schoolId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token has expired.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

// Authorization middleware factory
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Access denied. User not authenticated.",
        });
      }

      // Check if user has required role
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during authorization.",
      });
    }
  };
};

// School-based authorization middleware
// export const authorizeSchool = async (req, res, next) => {
//   try {
//     // Check if user is authenticated
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: "Access denied. User not authenticated.",
//       });
//     }

//     // Super admin can access all schools
//     if (req.user.role === "admin") {
//       return next();
//     }

//     // Get schoolId from params or body
//     const targetSchoolId = req.params.schoolId || req.body.schoolId;

//     if (!targetSchoolId) {
//       return res.status(400).json({
//         success: false,
//         message: "School ID is required.",
//       });
//     }

//     // Check if user belongs to the same school
//     if (
//       req.user.schoolId &&
//       req.user.schoolId.toString() !== targetSchoolId.toString()
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied. You can only access data from your school.",
//       });
//     }

//     next();
//   } catch (error) {
//     console.error("School authorization error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error during school authorization.",
//     });
//   }
// };

// Resource ownership middleware (for counselors accessing their own assessments)
export const authorizeOwnership = (resourceType = "assessment") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Access denied. User not authenticated.",
        });
      }

      // Admins and superadmins can access all resources
      if (["admin"].includes(req.user.role)) {
        return next();
      }

      // For counselors, check if they own the resource
      if (req.user.role === "staff") {
        const targetCounselorId =
          req.params.counselorId || req.body.counselorId;

        if (
          targetCounselorId &&
          req.user.id.toString() !== targetCounselorId.toString()
        ) {
          return res.status(403).json({
            success: false,
            message: "Access denied. You can only access your own resources.",
          });
        }
      }

      next();
    } catch (error) {
      console.error("Ownership authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during ownership authorization.",
      });
    }
  };
};

// Validation middleware for MongoDB ObjectIds
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      return res.status(400).json({
        success: false,
        message: `${paramName} is required.`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format.`,
      });
    }

    next();
  };
};

// Multiple ObjectIds validation
export const validateMultipleObjectIds = (paramNames = []) => {
  return (req, res, next) => {
    const errors = [];

    for (const paramName of paramNames) {
      const id = req.params[paramName] || req.body[paramName];

      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        errors.push(`Invalid ${paramName} format.`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors,
      });
    }

    next();
  };
};

// Rate limiting middleware (basic implementation)
const requestCounts = new Map();

export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request history for this identifier
    if (!requestCounts.has(identifier)) {
      requestCounts.set(identifier, []);
    }

    const requests = requestCounts.get(identifier);

    // Remove old requests outside the window
    const validRequests = requests.filter(
      (timestamp) => timestamp > windowStart
    );

    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    // Add current request
    validRequests.push(now);
    requestCounts.set(identifier, validRequests);

    next();
  };
};

// Assessment-specific authorization
export const authorizeAssessmentAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not authenticated.",
      });
    }

    // Super admins can access everything
    if (req.user.role === "superadmin") {
      return next();
    }

    // School admins can access all assessments in their school
    if (req.user.role === "admin") {
      // School authorization will be handled by authorizeSchool middleware
      return next();
    }

    // Counselors can only access their own assessments
    if (req.user.role === "staff") {
      const targetCounselorId = req.params.counselorId || req.body.counselorId;

      if (
        targetCounselorId &&
        req.user.id.toString() !== targetCounselorId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. Counselors can only access their own assessments.",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Assessment authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during assessment authorization.",
    });
  }
};

// Middleware to check if assessment can be modified
export const checkAssessmentModifiable = async (req, res, next) => {
  try {
    const { assessmentId } = req.params;

    if (!assessmentId) {
      return next(); // Let other validation handle missing ID
    }

    // Import Assessment model here to avoid circular dependency
    const Assessment = (await import("../models/assessment.model.js")).default;

    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found.",
      });
    }

    if (assessment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot modify a completed assessment.",
      });
    }

    // Add assessment to request for use in controller
    req.assessment = assessment;
    next();
  } catch (error) {
    console.error("Assessment modification check error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during assessment check.",
    });
  }
};
